const Vital = require("../models/Vital");


// Add Vital Record
exports.addVital = async (req, res) => {

  try {

    const {
      patientId,
      bloodPressure,
      weight,
      glucose,
      heartRate,
      notes,
      recordedBy
    } = req.body;

    const vital = new Vital({
      patientId,
      bloodPressure,
      weight,
      glucose,
      heartRate,
      notes,
      recordedBy
    });

    await vital.save();

    res.status(201).json({
      message: "Vital record added",
      vital
    });

  } catch (error) {

    console.error("Vital Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// Get patient vitals
exports.getVitals = async (req, res) => {

  try {

    const vitals = await Vital.find({
      patientId: req.params.patientId
    });

    res.json(vitals);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
  }
};