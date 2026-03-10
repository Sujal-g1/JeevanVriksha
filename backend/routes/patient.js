const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

router.get("/dashboard-data", verifyToken, patientController.getFullDashboardData);

router.get("/test", (req, res) => {
  res.json({ message: "Patient route working" });
});



module.exports = router;