const db = require('./db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { username, email, password } = req.body || {};

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required fields.' });
    }

    if (username.trim().length < 3 || password.length < 6) {
        return res.status(400).json({ error: 'Username must be at least 3 characters and password at least 6 characters.' });
    }

    try {
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [username.trim(), email.trim().toLowerCase(), hashedPassword]);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            userId: result.insertId
        });
        
    } catch (err) {
        console.error('Registration error:', err);
        
        // Handle duplicate entry error (MySQL error code ER_DUP_ENTRY)
        if (err.code === 'ER_DUP_ENTRY') {
            if (err.message.includes('username')) {
                return res.status(409).json({ error: 'This username is already taken.' });
            }
            if (err.message.includes('email')) {
                return res.status(409).json({ error: 'This email is already registered.' });
            }
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        return res.status(500).json({ error: 'Internal server error. Database connection might not be configured.' });
    }
};
