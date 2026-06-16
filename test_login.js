const db = require('./api/db_kv');
const bcrypt = require('bcryptjs');

async function test() {
  console.log("Checking admin user...");
  try {
    let user = await db.getUserByUsername('admin');
    console.log("User retrieved:", user);
    
    if (user) {
      const isMatch = await bcrypt.compare('admin1234', user.password);
      console.log("Password check match for 'admin1234':", isMatch);
    } else {
      console.log("Admin user was null!");
    }
  } catch (e) {
    console.error("Error during test:", e);
  }
}

test();
