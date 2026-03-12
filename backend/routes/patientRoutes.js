const express = require("express");
const router = express.Router();

console.log("PATIENT ROUTES FILE LOADED")

const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const patientController = require("../controllers/patientController");
const Patient = require("../models/Patient");


// Patient Dashboard
router.get(
  "/dashboard",
  verifyToken,
  authorizeRole("patient"),
  patientController.getFullDashboardData
);


// Get patient profile
router.get(
  "/profile",
  verifyToken,
  authorizeRole("patient"),
  patientController.getMyPatientProfile
);


// Get patient profile by id
router.get("/:id", verifyToken, async (req, res) => {
  try {

    const Patient = require("../models/Patient");

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.json(patient);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// updating patient 
// router.put("/update/:id", verifyToken, async (req, res) => {
//   try {

//     const Patient = require("../models/Patient");

//     const updatedPatient = await Patient.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!updatedPatient) {
//       return res.status(404).json({
//         message: "Patient not found"
//       });
//     }

//     res.json(updatedPatient);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }
// });


// UPDATE PATIENT PROFILE
router.put("/update/:id", verifyToken, async (req, res) => {

  console.log("Update body:", req.body)

  try {

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    )

    res.json(updated)

  } catch (err) {

    console.error("UPDATE ERROR:", err)  // IMPORTANT

    res.status(500).json({
      message: err.message
    })

  }

})

module.exports = router;