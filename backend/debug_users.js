const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function test() {
  await mongoose.connect("mongodb://localhost:27017/playmates_db");

  // Get ALL users and test their passwords
  const rawUsers = await User.collection.find({}).toArray();
  
  console.log("=== RAW USERS FROM DB ===");
  for (const u of rawUsers) {
    console.log("\nEmail:", u.email);
    console.log("Hash prefix:", u.password?.substring(0, 30));
    
    // Is it a valid bcrypt hash?
    const isBcrypt = u.password?.startsWith("$2");
    console.log("Valid bcrypt hash?", isBcrypt);
    
    // Count hash layers - bcrypt of bcrypt starts with $2 but won't match original
    // Try common passwords
    const testPasswords = ["dev", "admin", u.email?.split("@")[0], "123456", "password"];
    for (const pwd of testPasswords) {
      try {
        const match = await bcrypt.compare(pwd, u.password);
        if (match) {
          console.log(`✅ Password match: "${pwd}"`);
        }
      } catch(e) {}
    }
  }

  await mongoose.disconnect();
}

test().catch(console.error);
