const connectToDatabase = require('./db');
const User = require('./models/User');
const fileDb = require('./fileDb');
const { generateToken } = require('./authMiddleware');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    if (res.status) return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: `Method ${req.method} Not Allowed` }));
  }

  const { clerkId, email, username } = req.body || {};

  if (!clerkId && !email) {
    if (res.status) return res.status(400).json({ error: 'clerkId or email is required' });
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'clerkId or email is required' }));
  }

  const cleanEmail = email ? email.trim().toLowerCase() : '';
  let cleanUsername = username ? username.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '') : '';
  if (!cleanUsername && cleanEmail) {
    cleanUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
  }
  if (!cleanUsername || cleanUsername.length < 2) {
    cleanUsername = 'user_' + (clerkId ? clerkId.slice(-6) : Math.random().toString(36).slice(2, 6));
  }

  try {
    const { isMongo } = await connectToDatabase();
    let user = null;

    if (isMongo) {
      // Find user by clerkId or email
      if (clerkId) {
        user = await User.findOne({ clerkId });
      }
      if (!user && cleanEmail) {
        user = await User.findOne({ email: cleanEmail });
      }

      if (!user) {
        // Ensure unique username
        let candidate = cleanUsername;
        let counter = 1;
        while (await User.findOne({ username: candidate })) {
          candidate = cleanUsername + counter++;
        }

        user = await User.create({
          clerkId: clerkId || null,
          username: candidate,
          email: cleanEmail || `${clerkId}@clerk.user`,
          role: candidate === 'admin' ? 'admin' : 'user',
          credits: candidate === 'admin' ? 999999 : 50,
          isVerified: true
        });
      } else {
        // Update clerkId if not set
        if (clerkId && !user.clerkId) {
          user.clerkId = clerkId;
          await user.save();
        }
      }
    } else {
      // File DB fallback
      if (clerkId) {
        user = await fileDb.findUser({ clerkId });
      }
      if (!user && cleanEmail) {
        user = await fileDb.findUser({ email: cleanEmail });
      }

      if (!user) {
        let candidate = cleanUsername;
        let counter = 1;
        while (await fileDb.findUser({ username: candidate })) {
          candidate = cleanUsername + counter++;
        }

        user = await fileDb.createUser({
          clerkId: clerkId || null,
          username: candidate,
          email: cleanEmail || `${clerkId}@clerk.user`,
          role: candidate === 'admin' ? 'admin' : 'user',
          credits: candidate === 'admin' ? 999999 : 50,
          isVerified: true
        });
      } else {
        if (clerkId && !user.clerkId) {
          await fileDb.updateUser(user.username, { clerkId });
        }
      }
    }

    const token = generateToken(user);
    const responsePayload = {
      success: true,
      token,
      user: {
        id: user._id || user.id,
        clerkId: user.clerkId || clerkId,
        username: user.username,
        email: user.email,
        role: user.role,
        credits: user.credits,
        isVerified: true
      }
    };

    if (res.status && typeof res.status === 'function') {
      return res.status(200).json(responsePayload);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(responsePayload));

  } catch (err) {
    console.error('Error in /api/clerk-sync:', err);
    if (res.status && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Internal server error syncing Clerk user', message: err.message });
    }
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error syncing Clerk user', message: err.message }));
  }
};
