const mongoose = require("mongoose");
const vitalSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  bloodPressure: String,
  heartRate: Number,
  weight: Number,
  glucose: Number

}, { timestamps: true });