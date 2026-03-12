const express = require("express");
const router = express.Router();
const Pregnancy = require("../models/Pregnancy");
const Patient = require("../models/Patient");


// GET pregnancy record
router.get("/:patientId", async (req, res) => {

  try {

    const record = await Pregnancy.findOne({
      patientId: req.params.patientId
    });

    res.json(record || {});

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});


// UPDATE / CREATE pregnancy record
router.post("/update", async (req, res) => {

  try {

    const { patientId } = req.body;

    let record = await Pregnancy.findOne({ patientId });

    if (record) {

      record = await Pregnancy.findOneAndUpdate(
        { patientId },
        req.body,
        { new: true }
      );

    } else {

      record = await Pregnancy.create(req.body);

    }

    // ALWAYS ensure patient flag is correct
    await Patient.findByIdAndUpdate(patientId, {
      isPregnant: true
    });

    res.json(record);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});

module.exports = router;