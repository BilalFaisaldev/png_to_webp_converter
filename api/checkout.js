const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { extractToken, verifyToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token.' });
    }

    const { plan } = req.body || {};

    if (!plan) {
        return res.status(400).json({ error: 'Plan or credit package is required.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        let addedCredits = 0;
        let planName = 'Free';

        if (plan === 'credits_500') {
            addedCredits = 500;
            planName = '500 Extra Credits Pack ($5)';
        } else if (plan === 'pro') {
            addedCredits = 2500;
            planName = 'Pro Subscription ($9/mo)';
        } else if (plan === 'business') {
            addedCredits = 10000;
            planName = 'Business Unlimited ($29/mo)';
        } else {
            return res.status(400).json({ error: 'Invalid package selected.' });
        }

        let updatedUser = null;

        if (isMongo) {
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ error: 'User not found.' });

            user.credits = (user.credits || 0) + addedCredits;
            if (plan === 'pro' || plan === 'business') {
                user.role = plan;
            }
            await user.save();
            updatedUser = user;
        } else {
            const user = await fileDb.findUser({ username: decoded.username });
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const newTotal = (user.credits || 0) + addedCredits;
            await fileDb.updateUserCredits(user.username, newTotal);
            user.credits = newTotal;
            updatedUser = user;
        }

        return res.status(200).json({
            success: true,
            message: `Successfully purchased ${planName}! Added +${addedCredits} credits to your account.`,
            credits: updatedUser.credits
        });

    } catch (err) {
        console.error('Checkout API Error:', err);
        return res.status(500).json({ error: 'Internal server error processing payment checkout.' });
    }
};
