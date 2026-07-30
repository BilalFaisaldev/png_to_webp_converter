const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { sendOTPEmail } = require('./emailService');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const event = req.body || {};
    console.log('🔔 Received Automated SaaS Payment Webhook Event:', event.type || event.event_name);

    try {
        const { isMongo } = await connectToDatabase();

        // Extract Customer Email & Purchased Package from Stripe / LemonSqueezy Webhook
        const customerEmail = event.data?.object?.customer_email || event.data?.attributes?.user_email || event.email;
        const plan = event.data?.object?.metadata?.plan || event.meta?.custom_data?.plan || event.plan || 'pro';

        if (!customerEmail) {
            return res.status(400).json({ error: 'Webhook missing customer email payload.' });
        }

        let addedCredits = 2500;
        if (plan === 'credits_500') addedCredits = 500;
        if (plan === 'business') addedCredits = 10000;

        let user = isMongo
            ? await User.findOne({ email: customerEmail.toLowerCase() })
            : await fileDb.findUser({ email: customerEmail.toLowerCase() });

        if (!user) {
            console.warn(`⚠️ Webhook Warning: Customer email ${customerEmail} not found in DB.`);
            return res.status(200).json({ received: true, note: 'User not registered yet.' });
        }

        const newCredits = (user.credits || 0) + addedCredits;

        if (isMongo) {
            user.credits = newCredits;
            if (plan === 'pro' || plan === 'business') user.role = plan;
            await user.save();
        } else {
            await fileDb.updateUserCredits(user.username, newCredits);
        }

        console.log(`✅ Webhook Processed: Added +${addedCredits} credits to user ${user.username} (${user.email}). New Total: ${newCredits}`);

        return res.status(200).json({
            success: true,
            received: true,
            user: user.username,
            creditsAdded: addedCredits,
            totalCredits: newCredits
        });

    } catch (err) {
        console.error('❌ Webhook Handler Error:', err);
        return res.status(500).json({ error: 'Internal server error processing payment webhook.' });
    }
};
