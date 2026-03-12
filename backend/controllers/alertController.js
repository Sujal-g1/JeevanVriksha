const Vital = require("../models/Vital")
const Pregnancy = require("../models/Pregnancy")
const Newborn = require("../models/Newborn")

exports.getAlerts = async (req, res) => {
  try {

    const alerts = [];

    const Newborn = require("../models/Newborn");
    const Vital = require("../models/Vital");

    // Pregnancy vitals alerts
    const vitals = await Vital.find().populate("patientId", "name");

    vitals.forEach(v => {
      if (v.hb && v.hb < 10) {
        alerts.push({
          type: "danger",
          message: `Low hemoglobin detected for ${v.patientId?.name}`
        });
      }
    });

    // Newborn alerts
    const newborns = await Newborn.find().populate("patientId", "name");

    newborns.forEach(n => {

      if (n.birthWeight && n.birthWeight < 2.5) {
        alerts.push({
          type: "warning",
          message: `Low birth weight baby for ${n.patientId?.name}`
        });
      }

      if (n.temperature && n.temperature > 37.5) {
        alerts.push({
          type: "danger",
          message: `High temperature for newborn of ${n.patientId?.name}`
        });
      }

    });

    res.json(alerts);

  } catch (err) {

    console.error("ALERT ERROR:", err);

    res.status(500).json({
      message: "Alert system error"
    });

  }
};