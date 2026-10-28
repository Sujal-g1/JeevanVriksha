
const mongoose = require("mongoose");

const pregnancyVisitSchema = new mongoose.Schema(
  {
    pregnancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pregnancy",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    visitDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Gestational progress
    trimester: String,
    gestationalWeeks: Number,
    nextVisitDate: Date,

    // Maternal measurements
    temperature: Number,
    pulse: Number,
    hemoglobin: Number,
    bp: String,
    weight: Number,
    bloodGroup: String,
    bloodSugar: String,
    urineTest: String,

    // Screening
    hivScreening: String,
    syphilisScreening: String,
    hepatitisBScreening: String,

    // Fetal wellbeing
    fetalHeartRate: Number,
    fetalMovement: String,
    fundalHeight: Number,
    fetalPosition: String,

    // Ultrasound
    ultrasoundDate: Date,
    ultrasoundFindings: String,

    // Supplements and preventive care
    ironTablets: String,
    calciumTablets: String,
    folicAcid: String,
    tetanusVaccination: String,

    // Assessment and counselling
    highRiskPregnancy: String,
    dangerSigns: {
      type: [String],
      default: [],
    },
    nutritionCounselling: String,
    mentalWellbeing: String,
    referralStatus: String,

    // Follow-up
    ancVisits: Number,
    notes: String,
  },
  { timestamps: true }
);

pregnancyVisitSchema.index({
  pregnancyId: 1,
  visitDate: -1,
});

module.exports = mongoose.model(
  "PregnancyVisit",
  pregnancyVisitSchema
);
