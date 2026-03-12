const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  weight: Number,
  bloodPressure: String,
  hemoglobin: Number,
  temperature: Number,

  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Vital", vitalSchema);