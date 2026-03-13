const express = require("express")
const router = express.Router()

const verifyToken = require("../middleware/authMiddleware")
const authorizeRole = require("../middleware/roleMiddleware")

const {
addVisit,
getTodayVisits
} = require("../controllers/visitController")

router.post("/add",verifyToken,authorizeRole("asha"),addVisit)

router.get("/today",verifyToken,authorizeRole("asha"),getTodayVisits)

module.exports = router