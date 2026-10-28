
const mongoose = require("mongoose");

const pregnancySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    // Pregnancy dating
    lmpDate: Date,
    dueDate: Date,

    // Obstetric history
    gravida: Number,
    para: Number,
    previousPregnancyComplications: String,
    multiplePregnancy: {
      type: String,
      enum: ["Singleton", "Twins", "Higher order", "Unknown"],
      default: "Unknown",
    },

    // Pregnancy status and outcome
    status: {
      type: String,
      enum: ["ongoing", "delivered", "ended", "unknown"],
      default: "ongoing",
      index: true,
    },
    deliveryDate: Date,
    deliveryOutcome: String,
    deliveryNotes: String,

    // Birth preparedness
    birthFacility: String,
    emergencyContact: String,
    transportArranged: String,
    deliveryPlan: String,

    // General pregnancy notes
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pregnancy", pregnancySchema);
