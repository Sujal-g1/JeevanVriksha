require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ensure this path matches your model

const seedUsers = async () => {
  try {
    // 1. Connect to your DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌱 Connected to DB for seeding...");

    // 2. Clear existing users (Optional - start fresh)
    await User.deleteMany({});

    // 3. Encrypt a default password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password123", salt);

    // 4. Define the 3 types of users
    const users = [
      {
        name: "Dr. Aditi Sharma",
        identifier: "HEAD-001",
        password: password,
        role: "head_asha",
        areaCode: "DIST-01"
      },
      {
        name: "Suman Devi",
        identifier: "ASHA-101",
        password: password,
        role: "asha",
        areaCode: "VILL-01"
      },
      {
        name: "Rahul Kumar",
        identifier: "9999999999",
        password: password,
        role: "patient",
        areaCode: "VILL-01"
      }
    ];

    // 5. Insert into MongoDB
    await User.insertMany(users);
    console.log("✅ Successfully seeded 3 users!");
    console.log("-------------------------------");
    console.log("ASHA LOGIN -> ID: ASHA-101 | Pass: password123");
    console.log("PATIENT LOGIN -> ID: 9999999999 | Pass: password123");
    
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedUsers();