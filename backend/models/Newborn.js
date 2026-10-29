
const mongoose = require("mongoose");

const newbornSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
      index: true,
    },

    // Birth profile
    birthDate: Date,
    gender: {
      type: String,
      enum: ["Female", "Male", "Other", "Unknown", ""],
      default: "",
    },
    birthWeight: Number,
    birthLength: Number,
    headCircumference: Number,
    deliveryType: String,
    birthPlace: String,
    birthComplications: String,
    gestationalAgeWeeks: Number,

    // Current health observations
    temperature: Number,
    breastfeeding: String,
    feedingFrequency: String,
    urineOutput: String,
    stoolStatus: String,
    jaundice: String,
    cordCondition: String,

    // Follow-up and immunization summary
    immunizationStatus: {
      type: String,
      enum: ["Up to date", "Pending", "Not verified", ""],
      default: "",
    },
    nextVisitDate: Date,
    lastVisitDate: Date,

    // Additional information
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Newborn", newbornSchema);
