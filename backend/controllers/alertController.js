
const Vital = require("../models/Vital");
const Pregnancy = require("../models/Pregnancy");
const Newborn = require("../models/Newborn");
const Vaccination = require("../models/Vaccination");

exports.getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Helper: resolve patient information safely
    const getPatientInfo = (patient) => {
      if (!patient) {
        return {
          patientId: null,
          patientName: "Unknown patient",
        };
      }

      const patientData =
        typeof patient === "object" ? patient : null;

      return {
        patientId:
          patientData?._id?.toString() ||
          patientData?.id?.toString() ||
          (typeof patient === "string" ? patient : null),

        patientName:
          patientData?.name ||
          patientData?.fullName ||
          patientData?.patientName ||
          patientData?.motherName ||
          "Unknown patient",
      };
    };

    const addAlert = (type, message, patient, createdAt = new Date()) => {
      const { patientId, patientName } = getPatientInfo(patient);

      alerts.push({
        type,
        message: message(patientName),
        patientId,
        createdAt,
      });
    };

    // Pregnancy vitals alerts
    const vitals = await Vital.find().populate("patientId");

    vitals.forEach((v) => {
      if (v.hb && v.hb < 10) {
        addAlert(
          "danger",
          (name) => `Low hemoglobin detected for ${name}`,
          v.patientId,
          v.createdAt || v.updatedAt
        );
      }
    });

    // Newborn alerts
    const newborns = await Newborn.find().populate("patientId");

    newborns.forEach((n) => {
      if (n.birthWeight && n.birthWeight < 2.5) {
        addAlert(
          "warning",
          (name) => `Low birth weight baby for ${name}`,
          n.patientId,
          n.createdAt || n.updatedAt
        );
      }

      if (n.temperature && n.temperature > 37.5) {
        addAlert(
          "danger",
          (name) => `High temperature for newborn of ${name}`,
          n.patientId,
          n.createdAt || n.updatedAt
        );
      }
    });

    // Vaccine overdue alerts
    const overdueVaccines = await Vaccination.find({
      status: "pending",
      dueDate: { $lt: new Date() },
    }).populate("patientId");

    overdueVaccines.forEach((v) => {
      addAlert(
        "warning",
        (name) => `Vaccine overdue for ${name} (${v.vaccineName})`,
        v.patientId,
        v.createdAt || v.updatedAt || v.dueDate
      );
    });

    res.json(alerts);
  } catch (err) {
    console.error("ALERT ERROR:", err);

    res.status(500).json({
      message: "Alert system error",
    });
  }
};
