const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Pregnancy = require("../models/Pregnancy");
const Newborn = require("../models/Newborn");
const Vaccination = require("../models/Vaccination");
const Visit = require("../models/Visit");

router.get("/stats", async (req, res) => {

try {

const patients = await Patient.countDocuments();

const pregnant = await Patient.countDocuments({
pregnancyStatus: "pregnant"
});

const newborns = await Newborn.countDocuments();

const vaccineDue = await Vaccination.countDocuments({
nextDueDate: { $gte: new Date() }
});

const startOfDay = new Date();
startOfDay.setHours(0,0,0,0);

const visitsToday = await Visit.countDocuments({
createdAt: { $gte: startOfDay }
});

const highRisk = await Pregnancy.countDocuments({
hemoglobin: { $lt: 10 }
});

res.json({
patients,
pregnant,
highRisk,
newborns,
vaccineDue,
visitsToday
});

} catch (err) {

console.error("Dashboard stats error:", err);

res.status(500).json({
message: "Error loading dashboard stats"
});

}

});

module.exports = router;