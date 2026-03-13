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

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },

  dateGiven: {
    type: Date
  },

  dueDate: {
    type: Date
  },

  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Vaccination", vaccinationSchema);