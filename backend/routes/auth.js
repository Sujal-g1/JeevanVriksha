const express = require("express");
const router = express.Router();

const { patientSignup, patientLogin } = require("../controllers/authController");
const { googleLogin } = require("../controllers/authController");
const { staffLogin } = require("../controllers/authController");


router.post("/signup", patientSignup);
router.post("/login", patientLogin);
router.post("/google", googleLogin);
router.post("/staff-login", staffLogin);


module.exports = router;