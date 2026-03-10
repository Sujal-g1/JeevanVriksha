const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const patientController = require("../controllers/patientController");
const Patient = require("../models/Patient"); // Required for inline routes



// router.get("/dashboard-data", verifyToken, authorizeRole("patient"), patientController.getFullDashboardData);


router.get("/dashboard-data", verifyToken, patientController.getFullDashboardData);

// // 1. Patient Own Route
// router.get("/me", verifyToken, authorizeRole("patient"), patientController.getMyPatientProfile);

// // 2. Search (Used by ASHA)
// router.get("/search", verifyToken, authorizeRole("asha"), patientController.searchPatient);

// // 3. Update Profile
// router.put("/update/:id", verifyToken, async (req, res) => {
//   try {
//     const updatedPatient = await Patient.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updatedPatient);
//   } catch (error) {
//     res.status(500).json({ message: "Update failed" });
//   }
// });

module.exports = router;