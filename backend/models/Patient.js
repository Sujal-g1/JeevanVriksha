const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String,
  phone: String,
  email: String,

  village: String,
  bloodGroup: String,

  ageYears: {
  type: Number,
  min: 0,
  max: 120,
  default: 0,
},

ageMonths: {
  type: Number,
  min: 0,
  max: 11,
  default: 0,
},

ageDays: {
  type: Number,
  min: 0,
  max: 30,
  default: 0,
},

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },

  allergies: {
    type: String,
    default: "None"
  },

  chronicDiseases: {
    type: String,
    default: "None"
  },

  height: Number,
  emergencyContact: String,

  pregnancyStatus: {
    type: String,
    enum: ["not_pregnant", "pregnant", "delivered"],
    default: "not_pregnant"
  },

  expectedDeliveryDate: Date,

  isNewborn: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Patient", patientSchema);