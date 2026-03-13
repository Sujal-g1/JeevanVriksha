const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const medicineController = require("../controllers/medicineController");


/* ADMIN CREATES MEDICINE */
router.post(
  "/create",
  verifyToken,
  authorizeRole("admin"),
  medicineController.createMedicine
);


/* ADMIN ADDS STOCK TO ASHA */
router.post(
  "/stock",
  verifyToken,
  authorizeRole("admin"),
  medicineController.addStockToAsha
);


/* ASHA DISTRIBUTES MEDICINE */
router.post(
  "/distribute",
  verifyToken,
  authorizeRole("asha"),
  medicineController.distributeMedicine
);

/* GET ASHA STOCK */
router.get(
  "/my-stock",
  verifyToken,
  authorizeRole("asha"),
  medicineController.getAshaStock
);

/* PATIENT CONFIRMS MEDICINE */
router.post(
  "/confirm",
  verifyToken,
  authorizeRole("patient"),
  medicineController.confirmMedicine
);


/* GET PATIENT MEDICINES */
router.get(
  "/patient/:patientId",
  verifyToken,
  medicineController.getPatientMedicines
);


/* GET ALL MEDICINES */
router.get(
  "/all",
  verifyToken,
  medicineController.getAllMedicines
);

// get all asha stock by admin
router.get(
  "/admin/asha-stock",
  verifyToken,
  authorizeRole("admin"),
  medicineController.getAllAshaStock
);

// GET MEDICINE STATS
router.get(
  "/admin/medicine-stats",
  verifyToken,
  authorizeRole("admin"),
  medicineController.getMedicineStats
);

// GET FRAUD ALERTS
router.get(
  "/admin/fraud-alerts",
  verifyToken,
  authorizeRole("admin"),
  medicineController.getFraudAlerts
);

// GET STOCK ALERTS
router.get(
  "/admin/low-stock-alerts",
  verifyToken,
  authorizeRole("admin"),
  medicineController.getLowStockAlerts
);


module.exports = router;