const db = require('./db_kv');
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
        // Query user by username first, then email
        let user = await db.getUserByUsername(usernameOrEmail);
        if (!user) {
            user = await db.getUserByEmail(usernameOrEmail);
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username, email, or password.' });
        }

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
                username: user.username,
                email: user.email,
                credits: user.credits
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login verification.' });
    }
};
