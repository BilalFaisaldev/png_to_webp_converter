const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'png_to_webp_jwt_secret_key_2026_super_secure';

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
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
