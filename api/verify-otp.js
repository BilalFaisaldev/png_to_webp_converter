const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { generateOTP, sendOTPEmail } = require('./emailService');
const { generateToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { action, usernameOrEmail, otp } = req.body || {};

    if (!usernameOrEmail) {
        return res.status(400).json({ error: 'Username or Email is required.' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();

    try {
        const { isMongo } = await connectToDatabase();

        // Resend OTP Action
        if (action === 'resend') {
            let user = isMongo
                ? await User.findOne({ $or: [{ username: cleanInput }, { email: cleanInput }] })
                : await fileDb.findUser({ username: cleanInput }) || await fileDb.findUser({ email: cleanInput });

            if (!user) {
                return res.status(404).json({ error: 'User account not found.' });
            }

            const newOtp = generateOTP();
            const expires = new Date(Date.now() + 600000); // 10 mins

            if (isMongo) {
                user.otpCode = newOtp;
                user.otpExpires = expires;
                await user.save();
            } else {
                await fileDb.setOTP(user.username, newOtp, 600000);
            }

            await sendOTPEmail(user.email, newOtp, user.username);

            return res.status(200).json({
                success: true,
                message: `Fresh 6-digit verification code sent to ${user.email}.`
            });
        }

        // Verify OTP Action
        if (!otp) {
            return res.status(400).json({ error: 'Verification code OTP is required.' });
        }

        const cleanOtp = otp.trim();

        if (isMongo) {
            const user = await User.findOne({
                $or: [{ username: cleanInput }, { email: cleanInput }]
            });

            if (!user) {
                return res.status(404).json({ error: 'User account not found.' });
            }

            if (!user.otpCode || user.otpCode !== cleanOtp) {
                return res.status(400).json({ error: 'Invalid 6-digit verification code.' });
            }

            if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
                return res.status(400).json({ error: 'Verification code has expired. Please request a resend.' });
            }

            user.isVerified = true;
            user.otpCode = null;
            user.otpExpires = null;
            await user.save();

            const token = generateToken(user);

            return res.status(200).json({
                success: true,
                message: 'Email address verified successfully!',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    isVerified: true
                }
            });
        } else {
            const user = await fileDb.findUser({ username: cleanInput }) || await fileDb.findUser({ email: cleanInput });

            if (!user) {
                return res.status(404).json({ error: 'User account not found.' });
            }

            const result = await fileDb.verifyOTP(user.username, cleanOtp);

            if (!result.success) {
                return res.status(400).json({ error: result.reason });
            }

            const token = generateToken(result.user);

            return res.status(200).json({
                success: true,
                message: 'Email address verified successfully!',
                token,
                user: {
                    id: result.user._id,
                    username: result.user.username,
                    email: result.user.email,
                    role: result.user.role,
                    credits: result.user.credits,
                    isVerified: true
                }
            });
        }

    } catch (err) {
        console.error('Verify OTP API Error:', err);
        return res.status(500).json({ error: 'Internal server error verifying security OTP code.' });
    }
};
