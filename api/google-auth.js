const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const bcrypt = require('bcryptjs');
const { validateRealEmail } = require('./emailValidator');
const { generateToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { email, name, googleId } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: 'Google email address is required.' });
    }

    const validation = validateRealEmail(email);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.reason });
    }

    const cleanEmail = validation.cleanEmail;
    // Generate username from Google email or name
    let cleanUsername = (name ? name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : cleanEmail.split('@')[0]);
    if (cleanUsername.length < 3) cleanUsername = cleanEmail.split('@')[0];

    try {
        const { isMongo } = await connectToDatabase();
        let user = null;

        if (isMongo) {
            user = await User.findOne({ email: cleanEmail });

            if (!user) {
                // Generate random secure password for Google Auth user
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('g_auth_' + Math.random().toString(36), salt);

                // Ensure unique username
                let usernameCandidate = cleanUsername;
                let counter = 1;
                while (await User.findOne({ username: usernameCandidate })) {
                    usernameCandidate = cleanUsername + counter++;
                }

                user = await User.create({
                    username: usernameCandidate,
                    email: cleanEmail,
                    password: hashedPassword,
                    role: 'user',
                    credits: 50,
                    isVerified: true
                });
            } else {
                user.isVerified = true;
                await user.save();
            }
        } else {
            user = await fileDb.findUser({ email: cleanEmail });

            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('g_auth_' + Math.random().toString(36), salt);

                let usernameCandidate = cleanUsername;
                let counter = 1;
                while (await fileDb.findUser({ username: usernameCandidate })) {
                    usernameCandidate = cleanUsername + counter++;
                }

                user = await fileDb.createUser({
                    username: usernameCandidate,
                    email: cleanEmail,
                    password: hashedPassword,
                    role: 'user',
                    credits: 50,
                    isVerified: true
                });
            }
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Google Sign-In successful!',
            token,
            user: {
                id: user._id || user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                credits: user.credits,
                isVerified: true
            }
        });

    } catch (err) {
        console.error('Google Auth API Error:', err);
        return res.status(500).json({ error: 'Internal server error during Google Authentication.' });
    }
};
