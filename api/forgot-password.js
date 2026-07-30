const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { generateOTP, sendOTPEmail } = require('./emailService');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { usernameOrEmail } = req.body || {};

    if (!usernameOrEmail) {
        return res.status(400).json({ error: 'Username or Email address is required.' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();

    try {
        const { isMongo } = await connectToDatabase();
        let user = isMongo
            ? await User.findOne({ $or: [{ username: cleanInput }, { email: cleanInput }] })
            : await fileDb.findUser({ username: cleanInput }) || await fileDb.findUser({ email: cleanInput });

        if (!user) {
            return res.status(404).json({ error: 'No account found with this username or email address.' });
        }

        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 600000); // 10 minutes

        if (isMongo) {
            user.otpCode = otpCode;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            await fileDb.setOTP(user.username, otpCode, 600000);
        }

        await sendOTPEmail(user.email, otpCode, user.username);

        return res.status(200).json({
            success: true,
            message: `6-digit password reset code sent to ${user.email}.`,
            username: user.username,
            email: user.email
        });

    } catch (err) {
        console.error('Forgot Password API Error:', err);
        return res.status(500).json({ error: 'Internal server error processing password reset request.' });
    }
};
