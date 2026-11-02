const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { usernameOrEmail, otp, newPassword } = req.body || {};

    if (!usernameOrEmail || !otp || !newPassword) {
        return res.status(400).json({ error: 'Username/Email, 6-Digit Reset Code, and New Password are required.' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (isMongo) {
            const user = await User.findOne({
                $or: [{ username: cleanInput }, { email: cleanInput }]
            });

            if (!user) {
                return res.status(404).json({ error: 'User account not found.' });
            }

            if (!user.otpCode || user.otpCode !== cleanOtp) {
                return res.status(400).json({ error: 'Invalid 6-digit reset code.' });
            }

            if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
                return res.status(400).json({ error: 'Reset code has expired. Please request a new code.' });
            }

            user.password = hashedPassword;
            user.isVerified = true;
            user.otpCode = null;
            user.otpExpires = null;
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Password updated successfully! You can now log in with your new password.'
            });
        } else {
            const user = await fileDb.findUser({ username: cleanInput }) || await fileDb.findUser({ email: cleanInput });

            if (!user) {
                return res.status(404).json({ error: 'User account not found.' });
            }

            const otpCheck = await fileDb.verifyOTP(user.username, cleanOtp);
            if (!otpCheck.success) {
                return res.status(400).json({ error: otpCheck.reason });
            }

            // Update user password in local file DB
            await fileDb.updateUser(user.username, {
                password: hashedPassword,
                isVerified: true,
                otpCode: null,
                otpExpires: null
            });

            return res.status(200).json({
                success: true,
                message: 'Password updated successfully! You can now log in with your new password.'
            });
        }

    } catch (err) {
        console.error('Reset Password API Error:', err);
        return res.status(500).json({ error: 'Internal server error updating password.' });
    }
};
