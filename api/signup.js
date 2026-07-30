const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const bcrypt = require('bcryptjs');
const { validateRealEmail } = require('./emailValidator');
const { generateOTP, sendOTPEmail } = require('./emailService');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { username, email, password, creditsRequested } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, Email, and Password are required fields.' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Validate Real Email & Block Disposable Mail Domains
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.reason });
    }
    const cleanEmail = emailCheck.cleanEmail;

    if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 600000); // 10 minutes

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const role = cleanUsername === 'admin' ? 'admin' : 'user';
        const initialCredits = cleanUsername === 'admin' ? 999999 : (parseInt(creditsRequested, 10) || 50);

        if (isMongo) {
            // Check duplicates
            const existingUsername = await User.findOne({ username: cleanUsername });
            if (existingUsername) {
                return res.status(409).json({ error: 'Username is already taken.' });
            }

            const existingEmail = await User.findOne({ email: cleanEmail });
            if (existingEmail) {
                return res.status(409).json({ error: 'Email address is already registered.' });
            }

            const isVerified = cleanUsername === 'admin';

            await User.create({
                username: cleanUsername,
                email: cleanEmail,
                password: hashedPassword,
                role,
                credits: initialCredits,
                isVerified,
                otpCode: isVerified ? null : otpCode,
                otpExpires: isVerified ? null : otpExpires
            });

            if (!isVerified) {
                await sendOTPEmail(cleanEmail, otpCode, cleanUsername);
            }

            return res.status(201).json({
                success: true,
                requiresOtp: !isVerified,
                message: isVerified ? 'Admin registered successfully!' : `6-digit verification code sent to ${cleanEmail}. Please enter it to activate your account.`,
                username: cleanUsername,
                email: cleanEmail
            });
        } else {
            const existingUser = await fileDb.findUser({ username: cleanUsername });
            if (existingUser) {
                return res.status(409).json({ error: 'Username is already taken.' });
            }

            const existingEmailUser = await fileDb.findUser({ email: cleanEmail });
            if (existingEmailUser) {
                return res.status(409).json({ error: 'Email address is already registered.' });
            }

            const isVerified = cleanUsername === 'admin';

            await fileDb.createUser({
                username: cleanUsername,
                email: cleanEmail,
                password: hashedPassword,
                role,
                credits: initialCredits,
                isVerified,
                otpCode: isVerified ? null : otpCode,
                otpExpires: isVerified ? null : otpExpires
            });

            if (!isVerified) {
                await sendOTPEmail(cleanEmail, otpCode, cleanUsername);
            }

            return res.status(201).json({
                success: true,
                requiresOtp: !isVerified,
                message: isVerified ? 'Admin registered successfully!' : `6-digit verification code sent to ${cleanEmail}. Please enter it to activate your account.`,
                username: cleanUsername,
                email: cleanEmail
            });
        }

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Internal server error during account creation.' });
    }
};
