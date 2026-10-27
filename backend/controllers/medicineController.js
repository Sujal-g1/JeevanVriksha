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


exports.addStockToAsha = async (req, res) => {

  try {

    const { ashaId, medicineId, quantity } = req.body;

    let stock = await AshaStock.findOne({
      ashaId,
      medicineId
    });

    if (stock) {

      stock.quantity += quantity;
      await stock.save();

    } else {

      stock = await AshaStock.create({
        ashaId,
        medicineId,
        quantity
      });

    }

    res.json({
      message: "Stock updated",
      stock
    });

  } catch (error) {

    console.error("ADD STOCK ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



exports.distributeMedicine = async (req, res) => {
  try {
    const { patientId, medicineId, quantity } = req.body;
    const ashaId = req.user.id;

    // Validate input
    const requestedQuantity = Number(quantity);

    if (
      !patientId ||
      !medicineId ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Patient, medicine, and a valid positive quantity are required",
      });
    }

    // Find this medicine in the logged-in ASHA's stock
    const stock = await AshaStock.findOne({
      ashaId,
      medicineId,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "This medicine is not available in your stock",
      });
    }

    if (stock.quantity < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available quantity: ${stock.quantity}`,
      });
    }

    // Atomically deduct stock so concurrent requests cannot overspend it
    const updatedStock = await AshaStock.findOneAndUpdate(
      {
        _id: stock._id,
        quantity: { $gte: requestedQuantity },
      },
      {
        $inc: { quantity: -requestedQuantity },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedStock) {
      return res.status(409).json({
        success: false,
        message: "Stock changed during this request. Refresh and try again.",
      });
    }

    // Create the distribution record
    let distribution;

    try {
      distribution = await MedicineDistribution.create({
        patientId,
        medicineId,
        quantity: requestedQuantity,
        ashaId,
        givenDate: new Date(),
      });
    } catch (error) {
      // Restore stock if recording the distribution fails
      await AshaStock.updateOne(
        { _id: updatedStock._id },
        { $inc: { quantity: requestedQuantity } }
      );

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Medicine distributed and stock updated successfully",
      distribution,
      remainingStock: updatedStock.quantity,
    });
  } catch (error) {
    console.error("DISTRIBUTE MEDICINE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to distribute medicine",
    });
  }
};



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
GET ASHA MEDICINE DISTRIBUTION HISTORY
-------------------------------- */

exports.getMyDistributions = async (req, res) => {
  try {
    const ashaId = req.user.id;

    if (!ashaId) {
      return res.status(401).json({
        message: "ASHA user ID not found in authentication token",
      });
    }

    const distributions = await MedicineDistribution.find({ ashaId })
      .populate("patientId", "name phone village")
      .populate("medicineId", "name category dosage")
      .sort({ givenDate: -1 });

    return res.status(200).json({
      success: true,
      count: distributions.length,
      distributions,
    });
  } catch (error) {
    console.error("GET ASHA DISTRIBUTIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch medicine distribution history",
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


/* --------------------------------
GET ASHA STOCK by ADMIN
-------------------------------- */
exports.getAllAshaStock = async (req, res) => {

  try {

    const stock = await AshaStock
      .find()
      .populate("ashaId", "name workerId")
      .populate("medicineId", "name");

    const formatted = stock.map(item => ({
      ashaName: item.ashaId?.name,
      workerId: item.ashaId?.workerId,
      medicine: item.medicineId?.name,
      quantity: item.quantity
    }));

    res.json(formatted);

  } catch (error) {

    console.error("ADMIN STOCK ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* --------------------------------
GET MEDICINE STATS
-------------------------------- */
exports.getMedicineStats = async (req, res) => {

  try {

    const stats = await MedicineDistribution.aggregate([
      {
        $group: {
          _id: "$medicineId",
          totalDistributed: { $sum: "$quantity" }
        }
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 0,
          medicineName: "$medicine.name",
          totalDistributed: 1
        }
      }
    ]);

    res.json(stats);

  } catch (error) {

    console.error("MEDICINE STATS ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* --------------------------------
GET FRAUD ALERTS
-------------------------------- */
exports.getFraudAlerts = async (req, res) => {

  try {

    // 24 hours ago
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24);

    const alerts = await MedicineDistribution
      .find({
        confirmedByPatient: false,
        givenDate: { $lt: threshold }
      })
      .populate("patientId", "name phone village")
      .populate("ashaId", "name workerId")
      .populate("medicineId", "name");

    res.json(alerts);

  } catch (error) {

    console.error("FRAUD ALERT ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* --------------------------------
GET STOC ALERTS
-------------------------------- */
exports.getLowStockAlerts = async (req, res) => {

  try {

    const threshold = 20; // low stock limit

    const lowStock = await AshaStock
      .find({ quantity: { $lt: threshold } })
      .populate("ashaId", "name workerId")
      .populate("medicineId", "name");

    const formatted = lowStock.map(item => ({
      ashaName: item.ashaId?.name,
      workerId: item.ashaId?.workerId,
      medicine: item.medicineId?.name,
      quantity: item.quantity
    }));

    res.json(formatted);

  } catch (error) {

    console.error("LOW STOCK ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};