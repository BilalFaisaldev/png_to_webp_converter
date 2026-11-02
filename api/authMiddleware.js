const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'png_to_webp_jwt_secret_key_2026_super_secure';

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      clerkId: user.clerkId || null,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  if (!token) return null;

  // 1. Check local JWT signature
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // 2. Fallback: decode Clerk session JWT
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.id)) {
        return {
          id: decoded.sub || decoded.id,
          clerkId: decoded.sub || null,
          username: decoded.username || decoded.sub || 'user',
          email: decoded.email || '',
          role: decoded.metadata?.role || decoded.role || 'user'
        };
      }
    } catch (decodeErr) {}
    return null;
  }
}

function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  JWT_SECRET
};
