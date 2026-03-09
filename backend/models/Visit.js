const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  symptoms: [String],

  diagnosis: String,

  notes: String

}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);