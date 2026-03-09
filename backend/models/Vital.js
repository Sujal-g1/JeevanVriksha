const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  bloodPressure: String,

  glucose: Number,

  weight: Number,

  heartRate: Number,

  notes: String,

  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Vital", vitalSchema);