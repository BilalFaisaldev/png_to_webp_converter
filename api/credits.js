const db = require('./db_kv');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { username, amount } = req.body || {};

    if (!username || amount === undefined) {
        return res.status(400).json({ error: 'Username and amount are required.' });
    }

    try {
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Subtract credits
        const currentCredits = parseInt(user.credits || '0', 10);
        const amountToSubtract = parseInt(amount, 10);

        if (currentCredits < amountToSubtract) {
            return res.status(400).json({ error: 'Insufficient credits for this conversion.' });
        }

        const newCredits = Math.max(0, currentCredits - amountToSubtract);
        const success = await db.updateUserCredits(username, newCredits);

        if (!success) {
            throw new Error('Failed to update credits in KV store');
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Credits consumed successfully.',
            credits: newCredits 
        });

    } catch (err) {
        console.error('Credits error:', err);
        return res.status(500).json({ error: 'Internal server error while consuming credits.' });
    }
};
