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

    // 1️⃣ Find ASHA stock for this medicine
    const stock = await AshaStock.findOne({
      ashaId: req.user.id,
      medicineId
    });

    if (!stock) {
      return res.status(400).json({
        message: "Medicine not available in ASHA stock"
      });
    }

    // 2️⃣ Check stock quantity
    if (stock.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient medicine stock"
      });
    }

    // 3️⃣ Deduct stock
    stock.quantity -= quantity;
    await stock.save();

    // 4️⃣ Create distribution record
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

    console.error("MEDICINE DISTRIBUTION ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* --------------------------------
PATIENT CONFIRMS MEDICINE
-------------------------------- */
// exports.confirmMedicine = async (req, res) => {

//   try {

//     const { distributionId } = req.body;

//     const distribution = await MedicineDistribution.findByIdAndUpdate(

//       distributionId,
//       { confirmedByPatient: true },
//       { new: true }

//     );

//     res.json({
//       message: "Medicine confirmed",
//       distribution
//     });

//   } catch (error) {

//     res.status(500).json({ message: "Server error" });

//   }

// };

exports.confirmMedicine = async (req, res) => {

  try {

    const { distributionId } = req.body;

    if (!distributionId) {
      return res.status(400).json({
        message: "distributionId required"
      });
    }

    const distribution = await MedicineDistribution.findById(distributionId);

    if (!distribution) {
      return res.status(404).json({
        message: "Distribution not found"
      });
    }

    distribution.confirmedByPatient = true;
    await distribution.save();

    res.json({
      message: "Medicine confirmed",
      distribution
    });

  } catch (error) {

    console.error("CONFIRM ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

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


/* --------------------------------
GET ASHA STOCK
-------------------------------- */
exports.getAshaStock = async (req, res) => {

  try {

    const stock = await AshaStock
      .find({ ashaId: req.user.id })
      .populate("medicineId", "name category dosage");

    res.json(stock);

  } catch (error) {

    console.error("ASHA STOCK ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* --------------------------------
GET ALL MEDICINES
-------------------------------- */
exports.getAllMedicines = async (req, res) => {

  try {

    const medicines = await Medicine.find().sort({ name: 1 });

    res.json(medicines);

  } catch (error) {

    console.error("GET MEDICINES ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};