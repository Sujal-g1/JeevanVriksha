const express = require("express");
const router = express.Router();

const {
  addVaccination,
  getVaccinations,
  completeVaccination
} = require("../controllers/vaccinationController");

router.post("/add", addVaccination);

router.get("/:patientId", getVaccinations);
router.patch("/complete/:id", completeVaccination)

module.exports = router;