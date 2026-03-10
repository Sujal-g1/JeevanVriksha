const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");

// -------------------   Patient Signup ----------------
// exports.patientSignup = async (req, res) => {
//     console.log("Signup API hit");
//   try {

//     const { name, phone, password } = req.body;

//     if (!name || !phone || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const existingUser = await User.findOne({ phone });

//     if (existingUser) {
//       return res.status(400).json({ message: "Phone already registered" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name,
//       phone,
//       password: hashedPassword,
//       role: "patient"
//     });

//     await user.save();

//     res.status(201).json({
//       message: "Signup successful"
//     });

//   } catch (error) {

//   console.log("🔥 SIGNUP ERROR START");
//   console.log(error);
//   console.log("🔥 SIGNUP ERROR END");

//   res.status(500).json({
//     message: "Server error",
//     error: error.message
//   });
// }
// };
exports.patientSignup = async (req, res) => {
  console.log("Signup API hit");

  try {

    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = new User({
      name,
      phone,
      password: hashedPassword,
      role: "patient"
    });

    await user.save();

    // 🔥 Create Patient profile automatically
    const patient = new Patient({
      name,
      phone,
      userId: user._id
    });

    await patient.save();

    res.status(201).json({
      message: "Signup successful",
      user,
      patient
    });

  } catch (error) {

    console.log("🔥 SIGNUP ERROR START");
    console.log(error);
    console.log("🔥 SIGNUP ERROR END");

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};


// -------------------   Patient Login ----------------

exports.patientLogin = async (req, res) => {

  console.log("Login request received");
  console.log(req.body);

  try {

    const { phone, password } = req.body;

    console.log("Searching user...");

    const user = await User.findOne({ phone });

    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Checking password...");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    console.log("Generating token...");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// -------------------   Google  Login ----------------
// exports.googleLogin = async (req, res) => {
//   try {

//     const admin = require("../config/firebaseAdmin");
//     const User = require("../models/User");
//     const jwt = require("jsonwebtoken");

//     const { token } = req.body;

//     if(!token){
//       return res.status(400).json({
//         message: "Firebase token missing"
//       });
//     }

//     // Verify Firebase token
//     const decodedToken = await admin.auth().verifyIdToken(token);

//     const { name, email, uid } = decodedToken;

//     // Check if user exists
//     let user = await User.findOne({ googleId: uid });

//     if(!user){

//       // Create new patient user
//       user = new User({
//         name: name || "Google User",
//         googleId: uid,
//         role: "patient"
//       });

//       await user.save();
//     }

//     // Generate JWT for your system
//     const jwtToken = jwt.sign(
//       {
//         id: user._id,
//         role: user.role
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Google login successful",
//       token: jwtToken,
//       role: user.role
//     });

//   } catch(error){

//     console.error("Google Auth Error:", error);

//     res.status(500).json({
//       message: "Google authentication failed"
//     });
//   }
// };

exports.googleLogin = async (req, res) => {
  try {

    const { token } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(token);

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || "Google User";

    let user = await User.findOne({ googleId: uid });

    if (!user) {
      user = new User({
        name: name,
        googleId: uid,
        role: "patient"
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token: jwtToken,
      role: user.role
    });

  } catch (error) {

    console.error("Google Auth Error:", error);

    res.status(500).json({
      message: "Google authentication failed"
    });
  }
};




// -------------------   Staff  Login ----------------
// exports.staffLogin = async (req, res) => {
//   try {

//     console.log("📥 Staff login request received:", req.body);
//     const { workerId, password } = req.body;

//     if (!workerId || !password) {
//       return res.status(400).json({
//         message: "Worker ID and password required"
//       });
//     }

//     const user = await User.findOne({ identifier: workerId });

//     if (!user) {
//       return res.status(404).json({
//         message: "Worker not found"
//       });
//     }

//  if (!["asha", "admin", "head_asha"].includes(user.role)) {
//   return res.status(403).json({
//     message: "Access denied"
//   });
// }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid password"
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//    res.json({
//   message: "Staff login successful",
//   token,
//   user
// });

//   } catch (error) {

//     console.error("Staff Login Error:", error);

//     res.status(500).json({
//       message: "Server error"
//     });
//   }
// };

// ------------------- Staff Login ----------------
// exports.staffLogin = async (req, res) => {
//   try {

//     console.log("📥 Staff login request received:", req.body);

//     const { workerId, password } = req.body;

//     // Validate input
//     if (!workerId || !password) {
//       return res.status(400).json({
//         message: "Worker ID and password required"
//       });
//     }

//     console.log("🔎 Searching user for workerId:", workerId);

//     // Search user using workerId OR identifier
//     const user = await User.findOne({
//       $or: [
//         { workerId: workerId },
//         // { identifier: workerId }
//       ]
//     });

//     // User not found
//     if (!user) {
//       return res.status(404).json({
//         message: "Worker not found"
//       });
//     }

//     console.log("✅ User found:", user.name);

//     // Allow only staff roles
//     if (!["asha", "admin", "head_asha"].includes(user.role)) {
//       return res.status(403).json({
//         message: "Access denied"
//       });
//     }

//     console.log("🔐 Checking password...");

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid password"
//       });
//     }

//     console.log("🎟 Generating token...");

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Staff login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role,
//         workerId: user.workerId || user.identifier
//       }
//     });

//   } catch (error) {

//     console.error("❌ Staff Login Error:", error);

//     res.status(500).json({
//       message: "Server error"
//     });
//   }
// };


// ---------------- STAFF LOGIN ----------------
exports.staffLogin = async (req, res) => {

  try {

    const { workerId, password } = req.body;

    console.log("📥 Staff login request:", req.body);

    // Validate input
    if (!workerId || !password) {
      return res.status(400).json({
        message: "Worker ID and password required"
      });
    }

    // Find user by workerId
    const user = await User.findOne({ workerId });

    if (!user) {
      return res.status(404).json({
        message: "Worker not found"
      });
    }

    // Allow only staff roles
    if (!["asha", "admin", "head_asha"].includes(user.role)) {
      return res.status(403).json({
        message: "Not authorized for staff login"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful:", user.name);

    console.log("Sending response:", {
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    role: user.role,
    workerId: user.workerId
  }
});

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        workerId: user.workerId
      }
    });

  } catch (error) {

    console.error("❌ Staff Login Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }

};


// ---------------- Visit ----------------
exports.addVisit = async(req,res)=>{

try{

const visit = new Visit(req.body)

await visit.save()

res.json({
message:"Visit recorded"
})

}catch(err){

res.status(500).json({message:"Server error"})

}

}