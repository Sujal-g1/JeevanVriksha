const express = require("express");
const router = express.Router();

const {
  addVital,
  getVitals
} = require("../controllers/vitalController");

router.post("/add", addVital);

router.get("/:patientId", getVitals);

module.exports = router;