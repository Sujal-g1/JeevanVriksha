
const express = require("express");
const router = express.Router();

const Newborn = require("../models/Newborn");
const { generateNewbornVaccines } = require("../utils/generateNewbornVaccines");

router.get("/:patientId", async (req, res) => {
  try {
    const record = await Newborn.findOne({
      patientId: req.params.patientId,
    });

    return res.json(record || {});
  } catch (error) {
    console.error("Get newborn error:", error);
    return res.status(500).json({ message: "Unable to load newborn record." });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { patientId, birthDate } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required." });
    }

    const existing = await Newborn.findOne({ patientId });
    const update = { ...req.body };
    delete update._id;
    delete update.__v;
    delete update.createdAt;
    delete update.updatedAt;

    const record = await Newborn.findOneAndUpdate(
      { patientId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    // Only generate a schedule when the birth date is known.
    // The generator checks for existing vaccine records, avoiding duplicates.
    const effectiveBirthDate = birthDate || record.birthDate;

    if (effectiveBirthDate) {
      await generateNewbornVaccines(patientId, new Date(effectiveBirthDate));
    }

    return res.json({
      message: existing
        ? "Newborn record updated successfully."
        : "Newborn record created successfully.",
      newborn: record,
    });
  } catch (error) {
    console.error("Save newborn error:", error);
    return res.status(500).json({ message: "Unable to save newborn record." });
  }
});

module.exports = router;
