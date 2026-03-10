const Patient = require("../models/Patient");
const Vital = require("../models/Vital");
const Vaccination = require("../models/Vaccination");

// exports.getFullDashboardData = async (req, res) => {
//   try {
//     // 1. Get the Basic Patient Profile
//     const patient = await Patient.findOne({ userId: req.user.id });
//     if (!patient) return res.status(404).json({ message: "Profile not found" });

//     // 2. Get the latest Vitals for this patient
//     const latestVitals = await Vital.findOne({ patientId: patient._id }).sort({ createdAt: -1 });

//     // 3. Get all Vaccinations
//     const vaccinations = await Vaccination.find({ patientId: patient._id }).sort({ dueDate: 1 });

//     // 4. Send everything in one big object
//     res.json({
//       profile: patient,
//       vitals: latestVitals || { message: "No vitals recorded yet" },
//       vaccinations: vaccinations || []
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };








// const User = require("../models/User");
// const Patient = require("../models/Patient");
// const Visit = require("../models/Visit"); 
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // 1. Register Patient (Creating BOTH User and Patient Profile)
// exports.registerPatient = async (req, res) => {
//   try {
//     const { name, phone, password, age, gender, bloodGroup, village, ashaId } = req.body;

//     // Check if user already exists in the User collection
//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this phone already exists" });
//     }

//     // Hash the password (so they can log in later)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password || "123456", salt); // Default password if none provided

//     // Create User Entry
//     const user = new User({
//       name,
//       phone,
//       password: hashedPassword,
//       role: "patient"
//     });
//     await user.save();

//     // Create Patient Profile linked to that User
//     const patient = new Patient({
//       userId: user._id,
//       name,
//       phone,
//       age,
//       gender,
//       bloodGroup,
//       village,
//       ashaId
//     });
//     await patient.save();

//     res.status(201).json({
//       message: "Patient and User account created successfully",
//       patient
//     });

//   } catch (error) {
//     console.error("Patient Registration Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 2. Get My Profile (For the logged-in Patient)
// exports.getMyPatientProfile = async (req, res) => {
//   try {
//     // req.user.id is populated by your verifyToken middleware
//     const patient = await Patient.findOne({ userId: req.user.id });
    
//     if (!patient) {
//       return res.status(404).json({ message: "Patient profile not found" });
//     }
//     res.json(patient);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // 3. Get Patient by User ID (Used by ASHA to view a specific profile)
// exports.getMyPatientProfile = async (req, res) => {
//   try {
//     // We use .populate() to get extra details if they are in other collections
//     const patient = await Patient.findOne({ userId: req.user.id });

//     if (!patient) {
//       return res.status(404).json({ message: "Patient profile not found" });
//     }

//     // For a beginner, it's easier to send everything in one object
//     res.json({
//       ...patient._doc,
//       // We can add mock data here until your other tables (Vaccines/Visits) are ready
//       vaccinations: [
//         { name: "BCG", date: "2025-10-12", status: "Completed" },
//         { name: "Polio", date: "2026-04-05", status: "Pending" }
//       ],
//       appointments: [
//         { title: "Monthly Checkup", date: "2026-03-20", time: "10:00 AM" }
//       ]
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // 4. Search Patient by Phone (Quick Check)
// exports.searchPatient = async (req, res) => {
//   try {
//     const { phone } = req.query;
//     const patient = await Patient.findOne({ phone });
    
//     res.json({
//       found: !!patient,
//       patient: patient || null
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


exports.getFullDashboardData = async (req, res) => {
  try {
    // 1. Find the patient profile linked to this user ID
    // req.user.id comes from your verifyToken middleware
    const patient = await Patient.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found. Please contact your ASHA." });
    }

    // 2. Fetch related data from other collections
    const latestVitals = await Vital.findOne({ patientId: patient._id }).sort({ createdAt: -1 });
    const vaccinations = await Vaccination.find({ patientId: patient._id });

    // 3. Return everything combined
    res.json({
      profile: patient,
      vitals: latestVitals || {},
      vaccinations: vaccinations || []
    });
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};