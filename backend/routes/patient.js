const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRole("patient"),
  (req, res) => {

    res.json({
      message: "Welcome to Patient Dashboard",
      user: req.user
    });

});

module.exports = router;