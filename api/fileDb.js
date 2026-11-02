const fs = require('fs');
const path = require('path');
const os = require('os');

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join(os.tmpdir(), '.data') : path.join(__dirname, '..', '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

let memoryUsers = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.warn('File DB storage warning (using in-memory fallback):', err.message);
  }
}

function readUsers() {
  ensureDataFile();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed = JSON.parse(data || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading users file, using memory cache:', e.message);
  }
  return memoryUsers;
}

function saveUsers(users) {
  memoryUsers = users;
  try {
    ensureDataFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.warn('Failed writing to users file (stored in memory cache):', err.message);
  }
}

async function findUser({ username, email, id }) {
  const users = readUsers();
  return users.find(u => {
    if (id && (u._id === id || u.id === id)) return true;
    if (username && u.username && u.username.toLowerCase() === username.toLowerCase()) return true;
    if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
    return false;
  }) || null;
}

async function createUser({ username, email, password, role = 'user', credits = 50, isVerified = false, otpCode = null, otpExpires = null }) {
  const users = readUsers();
  const newUser = {
    _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
    role,
    credits: parseInt(credits, 10) || 50,
    isVerified,
    otpCode,
    otpExpires: otpExpires ? new Date(otpExpires).toISOString() : null,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

async function setOTP(username, otpCode, expiresMs = 600000) {
  const users = readUsers();
  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username === cleanUsername);
  if (!user) return null;
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + expiresMs).toISOString();
  saveUsers(users);
  return user;
}

async function verifyOTP(username, otpCode) {
  const users = readUsers();
  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username === cleanUsername);
  if (!user) return { success: false, reason: 'User not found.' };

  if (!user.otpCode || user.otpCode !== otpCode.trim()) {
    return { success: false, reason: 'Invalid verification code.' };
  }

  if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
    return { success: false, reason: 'Verification code has expired. Please request a new code.' };
  }

  user.isVerified = true;
  user.otpCode = null;
  user.otpExpires = null;
  saveUsers(users);
  return { success: true, user };
}

async function updateUser(username, updates) {
  const users = readUsers();
  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username === cleanUsername);
  if (!user) return null;
  Object.assign(user, updates);
  saveUsers(users);
  return user;
}

async function updateUserCredits(username, credits) {
  const users = readUsers();
  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username === cleanUsername);
  if (!user) return null;
  user.credits = parseInt(credits, 10);
  saveUsers(users);
  return user;
}

async function deleteUser(username) {
  let users = readUsers();
  const cleanUsername = username.trim().toLowerCase();
  const initialLength = users.length;
  users = users.filter(u => u.username !== cleanUsername);
  if (users.length === initialLength) return false;
  saveUsers(users);
  return true;
}

async function getAllUsers() {
  const users = readUsers();
  return users.map(u => ({
    _id: u._id,
    username: u.username,
    email: u.email,
    role: u.role,
    credits: u.credits,
    isVerified: !!u.isVerified,
    createdAt: u.createdAt
  }));
}

module.exports = {
  findUser,
  createUser,
  setOTP,
  verifyOTP,
  updateUser,
  updateUserCredits,
  deleteUser,
  getAllUsers
};
