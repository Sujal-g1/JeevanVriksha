const Vaccination = require("../models/Vaccination");

// add vaccine
exports.addVaccination = async (req, res) => {

  try {

    const { patientId, vaccineName, dueDate, status } = req.body;

    const vaccine = new Vaccination({
      patientId,
      vaccineName,
      dueDate,
      status
    });

    await vaccine.save();

    res.json({
      message: "Vaccination added",
      vaccine
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


// get vaccines for patient
exports.getVaccinations = async (req, res) => {

  try {

    const vaccines = await Vaccination.find({
      patientId: req.params.patientId
    });

    res.json(vaccines);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};