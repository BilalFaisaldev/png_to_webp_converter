const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { extractToken, verifyToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        let user = null;

        if (isMongo) {
            user = await User.findById(decoded.id).select('-password');
        } else {
            user = await fileDb.findUser({ username: decoded.username, id: decoded.id });
        }

        if (!user) {
            return res.status(404).json({ error: 'User account not found.' });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id || user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                credits: user.credits
            }
        });

    } catch (err) {
        console.error('API /me error:', err);
        return res.status(500).json({ error: 'Internal server error verifying user session.' });
    }
};
