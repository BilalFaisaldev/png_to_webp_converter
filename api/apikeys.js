const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const crypto = require('crypto');
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
        const action = req.query.action || (req.body && req.body.action) || 'list';

        if (action === 'generate' && req.method === 'POST') {
            const newKey = 'webp_live_' + crypto.randomBytes(16).toString('hex');

            if (isMongo) {
                const user = await User.findById(decoded.id);
                if (!user) return res.status(404).json({ error: 'User not found.' });
                user.apiKey = newKey;
                await user.save();
            } else {
                const user = await fileDb.findUser({ username: decoded.username });
                if (!user) return res.status(404).json({ error: 'User not found.' });
                
                // Save to local file DB
                await fileDb.updateUser(user.username, { apiKey: newKey });
            }

            return res.status(201).json({
                success: true,
                message: 'Developer API key generated successfully!',
                apiKey: newKey
            });
        }

        if (action === 'list' && req.method === 'GET') {
            let apiKey = null;

            if (isMongo) {
                const user = await User.findById(decoded.id).select('apiKey');
                apiKey = user ? user.apiKey : null;
            } else {
                const user = await fileDb.findUser({ username: decoded.username });
                apiKey = user ? user.apiKey : null;
            }

            return res.status(200).json({
                success: true,
                apiKey: apiKey || null
            });
        }

        return res.status(400).json({ error: 'Invalid API key action.' });

    } catch (err) {
        console.error('API Keys Endpoint Error:', err);
        return res.status(500).json({ error: 'Internal server error managing API keys.' });
    }
};
