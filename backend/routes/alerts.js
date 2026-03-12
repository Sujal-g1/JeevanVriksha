const express = require("express")
const router = express.Router()

const verifyToken = require("../middleware/authMiddleware")
const authorizeRole = require("../middleware/roleMiddleware")

const { getAlerts } = require("../controllers/alertController")

router.get("/",verifyToken,authorizeRole("asha"),getAlerts)

module.exports = router