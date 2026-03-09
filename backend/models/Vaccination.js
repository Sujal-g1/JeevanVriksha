const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },

  vaccineName: String,

  dueDate: Date,

  givenDate: Date,

  status: {
    type: String,
    enum: ["pending", "completed"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Vaccination", vaccinationSchema);