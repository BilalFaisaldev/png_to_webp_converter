const bcrypt = require('bcryptjs');

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
    const url = `${BASE_URL}/UpdateValue/${APP_KEY}/${key}/${value}`;
    console.log(`[setValue] Calling URL: ${url}`);
    const res = await fetch(url, {
      method: 'POST'
    });
    const text = await res.text();
    console.log(`[setValue] Response status: ${res.status}, text: ${JSON.stringify(text)}`);
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

// Track registered usernames in a global index
async function getUsernamesList() {
  const hex = await getValue('user_index_list');
  if (!hex) return [];
  try {
    return JSON.parse(fromHex(hex));
  } catch (e) {
    return [];
  }
}

async function saveUsernamesList(list) {
  const hex = toHex(JSON.stringify(list));
  return await setValue('user_index_list', hex);
}

async function getUserByUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  
  // Auto-seed admin user if requested and not present
  if (cleanUsername === 'admin') {
    const hexValue = await getValue('user_admin');
    if (!hexValue) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin1234', salt);
      await createUser('admin', 'admin@converter.com', hashedPassword, 999999);
    }
  }

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

async function createUser(username, email, hashedPassword, initialCredits = 50) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const emailHex = toHex(cleanEmail);
  
  const userObj = {
    username: username.trim(),
    email: email.trim(),
    password: hashedPassword,
    credits: initialCredits
  };
  
  const userHex = toHex(JSON.stringify(userObj));
  
  // Store user object under user_${username}
  const userStored = await setValue(`user_${cleanUsername}`, userHex);
  if (!userStored) return false;
  
  // Store username mapping under email_${emailHex}
  await setValue(`email_${emailHex}`, cleanUsername);

  // Add username to index list
  const list = await getUsernamesList();
  if (!list.includes(cleanUsername)) {
    list.push(cleanUsername);
    await saveUsernamesList(list);
  }

  return true;
}

async function updateUserCredits(username, credits) {
  const cleanUsername = username.trim().toLowerCase();
  const userObj = await getUserByUsername(cleanUsername);
  if (!userObj) return false;

  userObj.credits = parseInt(credits, 10);
  const userHex = toHex(JSON.stringify(userObj));
  return await setValue(`user_${cleanUsername}`, userHex);
}

async function deleteUser(username) {
  const cleanUsername = username.trim().toLowerCase();
  const userObj = await getUserByUsername(cleanUsername);
  if (!userObj) return false;

  // Clear user data (store empty string to represent deletion)
  await setValue(`user_${cleanUsername}`, '');
  
  const emailHex = toHex(userObj.email.trim().toLowerCase());
  await setValue(`email_${emailHex}`, '');

  // Remove from usernames index
  let list = await getUsernamesList();
  list = list.filter(u => u !== cleanUsername);
  await saveUsernamesList(list);

  return true;
}

async function getAllUsers() {
  // Ensure admin is seeded
  await getUserByUsername('admin');

  const list = await getUsernamesList();
  const users = [];
  for (const username of list) {
    const userObj = await getUserByUsername(username);
    if (userObj) {
      users.push({
        username: userObj.username,
        email: userObj.email,
        credits: userObj.credits
      });
    }
  }
  return users;
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUserCredits,
  deleteUser,
  getAllUsers
};
