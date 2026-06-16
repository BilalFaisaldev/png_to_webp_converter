const APP_KEY = process.env.KV_APP_KEY || '320n85kh';
const BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

async function getValue(key) {
  try {
    const res = await fetch(`${BASE_URL}/GetValue/${APP_KEY}/${key}`);
    const text = await res.text();
    let val = JSON.parse(text);
    if (val === "" || val === null || val === undefined) {
      return null;
    }
    return val;
  } catch (e) {
    console.error(`Error fetching key ${key}:`, e);
    return null;
  }
}

async function setValue(key, value) {
  try {
    const res = await fetch(`${BASE_URL}/UpdateValue/${APP_KEY}/${key}/${value}`, {
      method: 'POST'
    });
    const text = await res.text();
    return text === 'true';
  } catch (e) {
    console.error(`Error setting key ${key}:`, e);
    return false;
  }
}

function toHex(str) {
  return Buffer.from(str).toString('hex');
}

function fromHex(hex) {
  return Buffer.from(hex, 'hex').toString('utf8');
}

async function getUserByUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  const hexValue = await getValue(`user_${cleanUsername}`);
  if (!hexValue) return null;
  try {
    return JSON.parse(fromHex(hexValue));
  } catch (e) {
    return null;
  }
}

async function getUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  const emailHex = toHex(cleanEmail);
  const username = await getValue(`email_${emailHex}`);
  if (!username) return null;
  return getUserByUsername(username);
}

async function createUser(username, email, hashedPassword) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const emailHex = toHex(cleanEmail);
  
  const userObj = {
    username: username.trim(),
    email: email.trim(),
    password: hashedPassword
  };
  
  const userHex = toHex(JSON.stringify(userObj));
  
  // Store user object under user_${username}
  const userStored = await setValue(`user_${cleanUsername}`, userHex);
  if (!userStored) return false;
  
  // Store username mapping under email_${emailHex}
  const emailStored = await setValue(`email_${emailHex}`, cleanUsername);
  return emailStored;
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  createUser
};
