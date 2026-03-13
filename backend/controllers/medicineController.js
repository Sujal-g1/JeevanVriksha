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

// exports.addStockToAsha = async (req, res) => {

//   try {

//     const { ashaId, medicineId, quantity } = req.body;

//     const stock = await AshaStock.create({
//       ashaId,
//       medicineId,
//       quantity
//     });

//     res.json({
//       message: "Stock added to ASHA",
//       stock
//     });

//   } catch (error) {

//     res.status(500).json({ message: "Server error" });

//   }

// };
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

/* --------------------------------
ASHA DISTRIBUTES MEDICINE
-------------------------------- */
// exports.distributeMedicine = async (req, res) => {

//   try {

//     const { patientId, medicineId, quantity } = req.body;

//     // 1️⃣ Find ASHA stock for this medicine
//     const stock = await AshaStock.findOne({
//       ashaId: req.user.id,
//       medicineId
//     });

//     if (!stock) {
//       return res.status(400).json({
//         message: "Medicine not available in ASHA stock"
//       });
//     }

//     // 2️⃣ Check stock quantity
//     if (stock.quantity < quantity) {
//       return res.status(400).json({
//         message: "Insufficient medicine stock"
//       });
//     }

//     // 3️⃣ Deduct stock
//     stock.quantity -= quantity;
//     await stock.save();

//     // 4️⃣ Create distribution record
//     const distribution = await MedicineDistribution.create({
//       patientId,
//       medicineId,
//       quantity,
//       ashaId: req.user.id
//     });

//     res.json({
//       message: "Medicine distributed",
//       distribution
//     });

//   } catch (error) {

//     console.error("MEDICINE DISTRIBUTION ERROR:", error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };

// ----


// exports.distributeMedicine = async (req, res) => {

//   try {

//     const { patientId, medicineId, quantity } = req.body;

//     // find stock
//     const stock = await AshaStock.findOne({
//       ashaId: req.user.id,
//       medicineId
//     });

//     if (!stock) {
//       return res.status(400).json({
//         message: "Medicine not available in ASHA stock"
//       });
//     }

//     if (stock.quantity < quantity) {
//       return res.status(400).json({
//         message: "Not enough stock"
//       });
//     }

//     // deduct stock
//     stock.quantity -= quantity;
//     await stock.save();

//     // create distribution record
//     const distribution = await MedicineDistribution.create({
//       patientId,
//       medicineId,
//       quantity,
//       ashaId: req.user.id
//     });

//     res.json({
//       message: "Medicine distributed",
//       distribution,
//       remainingStock: stock.quantity
//     });

//   } catch (error) {

//     console.error("DISTRIBUTE ERROR:", error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };

exports.distributeMedicine = async (req,res) => {

try{

const { patientId, medicineId, quantity } = req.body

// Validation
if(!patientId || !medicineId || !quantity){
return res.status(400).json({
message:"Missing required fields"
})
}

// ASHA ID FROM TOKEN
const ashaId = req.user.id

const distribution = await MedicineDistribution.create({
patientId,
medicineId,
quantity,
ashaId
})

res.json({
message:"Medicine distributed",
distribution
})

}catch(err){

console.error("DISTRIBUTE ERROR:",err)

res.status(500).json({
message:"Server error"
})

}

}


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