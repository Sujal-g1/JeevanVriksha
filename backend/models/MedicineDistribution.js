const mongoose = require("mongoose");

const medicineDistributionSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  givenDate: {
    type: Date,
    default: Date.now
  },

  confirmedByPatient: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("MedicineDistribution", medicineDistributionSchema);