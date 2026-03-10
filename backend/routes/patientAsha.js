const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");


/* -------------------------------------
   GET ALL PATIENTS (ASHA)
------------------------------------- */

router.get("/", verifyToken, authorizeRole("asha"), async (req, res) => {

  try {

    const patients = await Patient.find().sort({ createdAt: -1 });

    res.json(patients);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});


/* -------------------------------------
   CHECK PATIENT BY PHONE
------------------------------------- */

router.get("/check/:phone", async (req, res) => {

  try {

    const phone = req.params.phone;

    const user = await User.findOne({ phone });

    if (user) {

      const patient = await Patient.findOne({ userId: user._id });

      return res.json({
        exists: true,
        patientId: patient?._id
      });

    }

    res.json({ exists: false });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});


/* -------------------------------------
   CREATE PATIENT (ASHA)
------------------------------------- */

router.post("/create", verifyToken, authorizeRole("asha"), async (req, res) => {

  try {

    const { name, phone, password, age, gender, village } = req.body;

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        message: "Patient already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phone,
      password: hashedPassword,
      role: "patient"
    });

    await user.save();

    const patient = new Patient({
      userId: user._id,
      name,
      age,
      gender,
      village,
      phone,
      ashaId: req.user.id
    });

    await patient.save();

    res.json({
      message: "Patient created successfully",
      patient
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});


/* -------------------------------------
   GET PATIENT PROFILE
------------------------------------- */

router.get("/:id", async (req, res) => {

  try {

    const patient = await Patient.findById(req.params.id);

    res.json(patient);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;