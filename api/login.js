const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTPEmail } = require('./emailService');
const { generateToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { usernameOrEmail, password } = req.body || {};

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/Email and Password are required fields.' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();

    try {
        const { isMongo } = await connectToDatabase();
        let user = null;

        if (isMongo) {
            user = await User.findOne({
                $or: [{ username: cleanInput }, { email: cleanInput }]
            });

            if (!user && cleanInput === 'admin') {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin1234', salt);
                user = await User.create({
                    username: 'admin',
                    email: 'admin@converter.com',
                    password: hashedPassword,
                    role: 'admin',
                    credits: 999999,
                    isVerified: true
                });
            }
        } else {
            user = await fileDb.findUser({ username: cleanInput }) || await fileDb.findUser({ email: cleanInput });

            if (!user && cleanInput === 'admin') {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin1234', salt);
                user = await fileDb.createUser({
                    username: 'admin',
                    email: 'admin@converter.com',
                    password: hashedPassword,
                    role: 'admin',
                    credits: 999999,
                    isVerified: true
                });
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username, email, or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username, email, or password.' });
        }

        // Require Email Verification (unless admin)
        if (!user.isVerified && user.username !== 'admin') {
            const otpCode = generateOTP();
            const otpExpires = new Date(Date.now() + 600000);

            if (isMongo) {
                user.otpCode = otpCode;
                user.otpExpires = otpExpires;
                await user.save();
            } else {
                await fileDb.setOTP(user.username, otpCode, 600000);
            }

            await sendOTPEmail(user.email, otpCode, user.username);

            return res.status(403).json({
                error: 'Your email address is unverified. We have sent a 6-digit verification code to your email.',
                requiresOtp: true,
                username: user.username,
                email: user.email
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
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
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login verification.' });
    }
};
