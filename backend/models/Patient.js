const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  age: {
    type: Number
  },

  gender: {
    type: String
  },

  bloodGroup: {
    type: String
  },

  village: {
    type: String
  },

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);