const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This will now use the encoded URI from your .env
    await mongoose.connect(process.env.MONGO_URI);
    // crsonsole.log(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Suggestion: if it fails, check if your IP is whitelisted in Atlas
    process.exit(1);
  }
};

module.exports = connectDB;