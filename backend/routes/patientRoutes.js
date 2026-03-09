const express = require("express");
const router = express.Router();

const {
  registerPatient,
  getPatients,
  getPatientById
} = require("../controllers/patientController");

router.post("/register", registerPatient);
router.get("/", getPatients);
router.get("/:id", getPatientById);

module.exports = router;