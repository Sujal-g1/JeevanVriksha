const crypto = require("crypto");
const Patient = require("../models/Patient");

const getOrCreateHealthCardToken = async (patientId) => {
  let patient = await Patient.findById(patientId)
    .select("+publicHealthToken");

  if (!patient) {
    throw new Error("Patient not found");
  }

  if (!patient.publicHealthToken) {
    patient.publicHealthToken = crypto.randomBytes(32).toString("hex");
    await patient.save();
  }

  return patient.publicHealthToken;
};

module.exports = getOrCreateHealthCardToken;