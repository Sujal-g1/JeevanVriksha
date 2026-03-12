const Medicine = require("../models/Medicine");
const AshaStock = require("../models/AshaStock");
const MedicineDistribution = require("../models/MedicineDistribution");

/* --------------------------------
CREATE MEDICINE (ADMIN)
-------------------------------- */

exports.createMedicine = async (req, res) => {

  try {

    const { name, category, dosage, description } = req.body;

    const medicine = await Medicine.create({
      name,
      category,
      dosage,
      description
    });

    res.json({
      message: "Medicine created",
      medicine
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/* --------------------------------
ADD MEDICINE STOCK TO ASHA
-------------------------------- */

exports.addStockToAsha = async (req, res) => {

  try {

    const { ashaId, medicineId, quantity } = req.body;

    const stock = await AshaStock.create({
      ashaId,
      medicineId,
      quantity
    });

    res.json({
      message: "Stock added to ASHA",
      stock
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/* --------------------------------
ASHA DISTRIBUTES MEDICINE
-------------------------------- */

exports.distributeMedicine = async (req, res) => {

  try {

    const { patientId, medicineId, quantity } = req.body;

    const distribution = await MedicineDistribution.create({

      patientId,
      medicineId,
      quantity,
      ashaId: req.user.id

    });

    res.json({
      message: "Medicine distributed",
      distribution
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/* --------------------------------
PATIENT CONFIRMS MEDICINE
-------------------------------- */

exports.confirmMedicine = async (req, res) => {

  try {

    const { distributionId } = req.body;

    const distribution = await MedicineDistribution.findByIdAndUpdate(

      distributionId,
      { confirmedByPatient: true },
      { new: true }

    );

    res.json({
      message: "Medicine confirmed",
      distribution
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/* --------------------------------
GET PATIENT MEDICINE HISTORY
-------------------------------- */

exports.getPatientMedicines = async (req, res) => {

  try {

    const medicines = await MedicineDistribution
      .find({ patientId: req.params.patientId })
      .populate("medicineId");

    res.json(medicines);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};