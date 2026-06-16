const db = require('./db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { usernameOrEmail, password } = req.body || {};

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required fields.' });
    }

    try {
        // Query user by username or email
        const query = 'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1';
        const [rows] = await db.query(query, [usernameOrEmail.trim(), usernameOrEmail.trim().toLowerCase()]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username, email, or password.' });
        }

        const user = rows[0];

        // Compare password hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username, email, or password.' });
        }

        // Return user data (omit password)
        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error. Database connection might not be configured.' });
    }
};
