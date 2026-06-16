const db = require('./api/db_kv');
const bcrypt = require('bcryptjs');

async function test() {
  console.log("Seeding and checking admin user...");
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin1234', salt);
    
    console.log("Calling db.createUser directly...");
    const created = await db.createUser('admin', 'admin@converter.com', hashedPassword, 999999);
    console.log("Create user returned:", created);

    console.log("Fetching admin user again...");
    let user = await db.getUserByUsername('admin');
    console.log("User retrieved:", user);
  } catch (e) {
    console.error("Error during test:", e);
  }
}

test();
