const Patient = require("../models/Patient");
const Vital = require("../models/Vital");
const Vaccination = require("../models/Vaccination");
const Visit = require("../models/Visit");
const Newborn = require("../models/Newborn");
const MedicineDistribution = require("../models/MedicineDistribution");

// ---------------- PATIENT PROFILE ----------------

exports.getMyPatientProfile = async (req, res) => {

  try {

    const patient = await Patient
      .findOne({ userId: req.user.id })
      .populate("ashaId", "name workerId");

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found"
      });
    }

    res.json(patient);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


// ---------------- DASHBOARD DATA ----------------

// exports.getFullDashboardData = async (req, res) => {

//   try {

//     const patient = await Patient
//       .findOne({ userId: req.user.id })
//       .populate("ashaId", "name workerId");

//     if (!patient) {
//       return res.status(404).json({
//         message: "Patient profile not found"
//       });
//     }

//     const vitals = await Vital
//       .find({ patientId: patient._id })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     const vaccinations = await Vaccination
//       .find({ patientId: patient._id });

//     const visits = await Visit
//       .find({ patientId: patient._id })
//       .sort({ visitDate: -1 });

//     const newborn = await Newborn
//       .find({ motherId: patient._id });

//     res.json({
//       profile: patient,
//       vitals,
//       vaccinations,
//       visits,
//       newborn
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };

exports.getFullDashboardData = async (req, res) => {

  try {

    const patient = await Patient
      .findOne({ userId: req.user.id })
      .populate("ashaId", "name workerId");

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found"
      });
    }

    const vitals = await Vital
      .find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const vaccinations = await Vaccination
      .find({ patientId: patient._id });

    const visits = await Visit
      .find({ patientId: patient._id })
      .sort({ visitDate: -1 });

    const newborn = await Newborn
      .find({ motherId: patient._id });

    /* ADD THIS PART */
    const medicines = await MedicineDistribution
      .find({ patientId: patient._id })
      .populate("medicineId");

    res.json({
      profile: patient,
      vitals,
      vaccinations,
      medicines,
      visits,
      newborn
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};