const mongoose = require("mongoose");
const vaccinationSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  vaccineName: String,
  dueDate: Date,
  status: String

}, { timestamps: true });