const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  vaccineName: {
    type: String,
    required: true
  },

  doseNumber: Number,

  dateGiven: Date,

  nextDueDate: Date,

  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Vaccination", vaccinationSchema);