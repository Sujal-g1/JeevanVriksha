const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String,
  phone: String,
  email: String,

  village: String,
  age: Number,
  bloodGroup: String,

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

  isNewborn: {
    type: Boolean,
    default: false
  },

  isPregnant: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


/* ---------- INDEX ---------- */

patientSchema.index({ userId: 1 }, { unique: true });


/* ---------- VIRTUAL RELATIONS ---------- */

patientSchema.virtual("vitals", {
  ref: "Vital",
  localField: "_id",
  foreignField: "patientId"
});


module.exports = mongoose.model("Patient", patientSchema);