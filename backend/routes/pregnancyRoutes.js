
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Pregnancy = require("../models/Pregnancy");
const PregnancyVisit = require("../models/PregnancyVisit");


const Patient = require("../models/Patient");

// GET pregnancy overview and complete ANC history
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const pregnancy = await Pregnancy.findOne({ patientId }).lean();

    if (!pregnancy) {
      return res.json({
        pregnancy: {},
        visits: [],
        latestVisit: null,
      });
    }

    const visits = await PregnancyVisit.find({
      pregnancyId: pregnancy._id,
    })
      .sort({ visitDate: -1, createdAt: -1 })
      .lean();

    return res.json({
      pregnancy,
      visits,
      latestVisit: visits[0] || null,
    });
  } catch (err) {
    console.error("Get pregnancy error:", err);

    return res.status(500).json({
      message: "Unable to load pregnancy record",
    });
  }
});

// CREATE OR UPDATE pregnancy details and record an ANC visit
router.post("/update", async (req, res) => {
  try {
    const { patientId, ...data } = req.body;

    if (!patientId || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Valid patient ID is required",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // Fields that belong to the pregnancy itself
    const pregnancyFields = [
      "lmpDate",
      "dueDate",
      "gravida",
      "para",
      "previousPregnancyComplications",
      "multiplePregnancy",
      "birthFacility",
      "emergencyContact",
      "transportArranged",
      "deliveryPlan",
      "notes",
    ];

    const pregnancyData = {};

    for (const field of pregnancyFields) {
      if (data[field] !== undefined) {
        pregnancyData[field] = data[field];
      }
    }

    let pregnancy = await Pregnancy.findOne({ patientId });

    if (pregnancy) {
      pregnancy.set(pregnancyData);
      await pregnancy.save();
    } else {
      pregnancy = await Pregnancy.create({
        patientId,
        ...pregnancyData,
      });
    }

    // Every save creates a separate visit record.
    const visitFields = [
      "trimester",
      "gestationalWeeks",
      "nextVisitDate",
      "temperature",
      "pulse",
      "hemoglobin",
      "bp",
      "weight",
      "bloodGroup",
      "bloodSugar",
      "urineTest",
      "hivScreening",
      "syphilisScreening",
      "hepatitisBScreening",
      "fetalHeartRate",
      "fetalMovement",
      "fundalHeight",
      "fetalPosition",
      "ultrasoundDate",
      "ultrasoundFindings",
      "ironTablets",
      "calciumTablets",
      "folicAcid",
      "tetanusVaccination",
      "highRiskPregnancy",
      "dangerSigns",
      "nutritionCounselling",
      "mentalWellbeing",
      "referralStatus",
      "ancVisits",
    ];

    const visitData = {};

    for (const field of visitFields) {
      if (data[field] !== undefined) {
        visitData[field] = data[field];
      }
    }

    // Save a visit only when the submitted form contains visit data.
    const hasVisitData = Object.keys(visitData).length > 0;

    let visit = null;

    if (hasVisitData) {
      visit = await PregnancyVisit.create({
        pregnancyId: pregnancy._id,
        patientId,
        ...visitData,
      });
    }

    await Patient.findByIdAndUpdate(patientId, {
      isPregnant: true,
    });

    const visits = await PregnancyVisit.find({
      pregnancyId: pregnancy._id,
    })
      .sort({ visitDate: -1, createdAt: -1 })
      .lean();

    return res.json({
      message: "Pregnancy information saved successfully",
      pregnancy,
      visit,
      visits,
      latestVisit: visits[0] || null,
    });
  } catch (err) {
    console.error("Save pregnancy error:", err);

    return res.status(500).json({
      message: "Unable to save pregnancy information",
    });
  }
});

// GET ANC visit history only
router.get("/:patientId/history", async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const pregnancy = await Pregnancy.findOne({ patientId }).select("_id");

    if (!pregnancy) {
      return res.json({ visits: [] });
    }

    const visits = await PregnancyVisit.find({
      pregnancyId: pregnancy._id,
    })
      .sort({ visitDate: -1, createdAt: -1 })
      .lean();

    return res.json({ visits });
  } catch (err) {
    console.error("ANC history error:", err);

    return res.status(500).json({
      message: "Unable to load ANC history",
    });
  }
});

module.exports = router;
