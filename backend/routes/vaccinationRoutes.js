const express = require("express");
const router = express.Router();

const {
  addVaccination,
  getVaccinations
} = require("../controllers/vaccinationController");

router.post("/add", addVaccination);

router.get("/:patientId", getVaccinations);

module.exports = router;