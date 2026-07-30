const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { extractToken, verifyToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Authorization token required.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        const action = req.query.action || (req.body && req.body.action) || 'deduct';

        if (action === 'deduct' && req.method === 'POST') {
            const count = parseInt(req.body.count || 1, 10);

            if (isMongo) {
                const user = await User.findById(decoded.id);
                if (!user) return res.status(404).json({ error: 'User not found.' });

                if (user.username !== 'admin' && user.credits < count) {
                    return res.status(402).json({ error: 'Insufficient credits. Upgrade plan or purchase top-up pack!' });
                }

                if (user.username !== 'admin') {
                    user.credits = Math.max(0, user.credits - count);
                    await user.save();
                }

                return res.status(200).json({
                    success: true,
                    credits: user.credits
                });
            } else {
                const user = await fileDb.findUser({ username: decoded.username });
                if (!user) return res.status(404).json({ error: 'User not found.' });

                if (user.username !== 'admin' && user.credits < count) {
                    return res.status(402).json({ error: 'Insufficient credits. Upgrade plan or purchase top-up pack!' });
                }

                let newCredits = user.credits;
                if (user.username !== 'admin') {
                    newCredits = Math.max(0, user.credits - count);
                    await fileDb.updateUserCredits(user.username, newCredits);
                }

                return res.status(200).json({
                    success: true,
                    credits: newCredits
                });
            }
        }

        return res.status(400).json({ error: 'Invalid credits action.' });

    } catch (err) {
        console.error('Credits API Error:', err);
        return res.status(500).json({ error: 'Internal server error processing credits.' });
    }
};
