const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const bcrypt = require('bcryptjs');
const { extractToken, verifyToken } = require('./authMiddleware');

module.exports = async (req, res) => {
    const token = extractToken(req);
    let isAdmin = false;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded && (decoded.role === 'admin' || decoded.username === 'admin')) {
            isAdmin = true;
        }
    }

    const adminHeader = req.headers['x-admin-auth'];
    const adminAuthTokenEnv = process.env.ADMIN_AUTH_TOKEN || 'admin1234';
    if (adminHeader && adminHeader === adminAuthTokenEnv) {
        isAdmin = true;
    }

    if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
    }

    try {
        const { isMongo } = await connectToDatabase();
        const action = req.query.action || (req.body && req.body.action) || 'list';

        if (action === 'list' && req.method === 'GET') {
            const users = isMongo
                ? await User.find({}, 'username email role credits createdAt').sort({ createdAt: -1 })
                : await fileDb.getAllUsers();
            return res.status(200).json({ success: true, users });
        }

        if (action === 'create_user' && req.method === 'POST') {
            const { username, email, password, credits, role } = req.body || {};

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required.' });
            }

            const cleanUsername = username.trim().toLowerCase();
            const cleanEmail = email.trim().toLowerCase();

            if (isMongo) {
                const existingUser = await User.findOne({
                    $or: [{ username: cleanUsername }, { email: cleanEmail }]
                });
                if (existingUser) {
                    return res.status(409).json({ error: 'User with this username or email already exists.' });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const newUser = await User.create({
                    username: cleanUsername,
                    email: cleanEmail,
                    password: hashedPassword,
                    role: role || (cleanUsername === 'admin' ? 'admin' : 'user'),
                    credits: parseInt(credits, 10) || 50
                });

                return res.status(201).json({
                    success: true,
                    message: 'User account created successfully!',
                    user: newUser
                });
            } else {
                const existingUser = await fileDb.findUser({ username: cleanUsername }) || await fileDb.findUser({ email: cleanEmail });
                if (existingUser) {
                    return res.status(409).json({ error: 'User with this username or email already exists.' });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const newUser = await fileDb.createUser({
                    username: cleanUsername,
                    email: cleanEmail,
                    password: hashedPassword,
                    role: role || (cleanUsername === 'admin' ? 'admin' : 'user'),
                    credits: parseInt(credits, 10) || 50
                });

                return res.status(201).json({
                    success: true,
                    message: 'User account created successfully!',
                    user: newUser
                });
            }
        }

        if (action === 'update_credits' && req.method === 'POST') {
            const { username, credits } = req.body || {};

            if (!username || credits === undefined) {
                return res.status(400).json({ error: 'Username and credits are required.' });
            }

            const cleanUsername = username.trim().toLowerCase();

            if (isMongo) {
                const updatedUser = await User.findOneAndUpdate(
                    { username: cleanUsername },
                    { credits: parseInt(credits, 10) },
                    { new: true }
                );
                if (!updatedUser) {
                    return res.status(404).json({ error: 'User not found.' });
                }
                return res.status(200).json({ success: true, message: `Credits updated to ${updatedUser.credits}.`, user: updatedUser });
            } else {
                const updatedUser = await fileDb.updateUserCredits(cleanUsername, credits);
                if (!updatedUser) {
                    return res.status(404).json({ error: 'User not found.' });
                }
                return res.status(200).json({ success: true, message: `Credits updated to ${updatedUser.credits}.`, user: updatedUser });
            }
        }

        if (action === 'delete_user' && req.method === 'POST') {
            const { username } = req.body || {};

            if (!username) {
                return res.status(400).json({ error: 'Username is required for deletion.' });
            }

            const cleanUsername = username.trim().toLowerCase();
            if (cleanUsername === 'admin') {
                return res.status(400).json({ error: 'Cannot delete default admin account.' });
            }

            if (isMongo) {
                const deletedUser = await User.findOneAndDelete({ username: cleanUsername });
                if (!deletedUser) {
                    return res.status(404).json({ error: 'User not found.' });
                }
                return res.status(200).json({ success: true, message: `User ${cleanUsername} deleted.` });
            } else {
                const deleted = await fileDb.deleteUser(cleanUsername);
                if (!deleted) {
                    return res.status(404).json({ error: 'User not found.' });
                }
                return res.status(200).json({ success: true, message: `User ${cleanUsername} deleted.` });
            }
        }

        return res.status(400).json({ error: 'Invalid admin action requested.' });

    } catch (err) {
        console.error('Admin API error:', err);
        return res.status(500).json({ error: 'Internal server error processing admin action.' });
    }
};
