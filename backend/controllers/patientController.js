const Patient = require("../models/Patient");

// Register Patient
exports.registerPatient = async (req, res) => {
  try {

    const {
      name,
      phone,
      age,
      gender,
      bloodGroup,
      village,
      ashaId
    } = req.body;

    const patient = new Patient({
      name,
      phone,
      age,
      gender,
      bloodGroup,
      village,
      ashaId
    });

    await patient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      patient
    });

  } catch (error) {

    console.error("Patient Registration Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};



// Get all patients
exports.getPatients = async (req, res) => {

  try {

    const patients = await Patient.find();

    res.json(patients);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
  }
};



// Get single patient
exports.getPatientById = async (req, res) => {

  try {

    const patient = await Patient.findById(req.params.id);

    res.json(patient);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
  }
};