const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ashaId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  phone: String,
  email: String, // Added for Digital Health Card/Notifications
  village: String,
  age: Number,
  bloodGroup: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  allergies: { type: String, default: "None" },
  chronicDiseases: { type: String, default: "None" },
  height: Number,
  emergencyContact: String,
  isNewborn: { type: Boolean, default: false },
  isPregnant: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);