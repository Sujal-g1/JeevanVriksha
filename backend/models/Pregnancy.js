const mongoose = require("mongoose");

const pregnancySchema = new mongoose.Schema({

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },

  expectedDeliveryDate: Date,

  trimester: Number,

  riskLevel: {
    type: String,
    enum: ["low", "medium", "high"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Pregnancy", pregnancySchema);