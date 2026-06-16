const db = require('./db_kv');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // Validate admin token
    const adminAuth = req.headers['x-admin-auth'];
    if (adminAuth !== 'admin1234') {
        return res.status(403).json({ error: 'Unauthorized. Admin credentials required.' });
    }

    const { action } = req.query || {};

    try {
        if (req.method === 'GET' && action === 'list') {
            const users = await db.getAllUsers();
            // Filter out admin details for display
            const filteredUsers = users.filter(u => u.username !== 'admin');
            return res.status(200).json({ success: true, users: filteredUsers });
        }

        if (req.method === 'POST') {
            const { username, email, password, credits } = req.body || {};

            if (action === 'create_user') {
                if (!username || !email || !password) {
                    return res.status(400).json({ error: 'Username, email, and password are required.' });
                }
                
                const existingUserByName = await db.getUserByUsername(username);
                if (existingUserByName) {
                    return res.status(409).json({ error: 'This username is already taken.' });
                }

                const existingUserByEmail = await db.getUserByEmail(email);
                if (existingUserByEmail) {
                    return res.status(409).json({ error: 'This email is already registered.' });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                const initialCredits = parseInt(credits || '50', 10);
                const success = await db.createUser(username, email, hashedPassword, initialCredits);
                if (!success) {
                    throw new Error('Failed to save user in KV store');
                }

                return res.status(201).json({ success: true, message: 'User created successfully!' });
            }

            if (action === 'update_credits') {
                if (!username || credits === undefined) {
                    return res.status(400).json({ error: 'Username and credits are required.' });
                }

                const success = await db.updateUserCredits(username, credits);
                if (!success) {
                    return res.status(404).json({ error: 'User not found.' });
                }

                return res.status(200).json({ success: true, message: 'Credits updated successfully!' });
            }

            if (action === 'delete_user') {
                if (!username) {
                    return res.status(400).json({ error: 'Username is required.' });
                }

                const success = await db.deleteUser(username);
                if (!success) {
                    return res.status(404).json({ error: 'User not found.' });
                }

                return res.status(200).json({ success: true, message: 'User deleted successfully!' });
            }
        }

        return res.status(400).json({ error: 'Invalid request action or method.' });

    } catch (err) {
        console.error('Admin endpoint error:', err);
        return res.status(500).json({ error: 'Internal server error in admin operations.' });
    }
};
