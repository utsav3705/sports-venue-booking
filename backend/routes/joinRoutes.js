const express = require("express");
const router = express.Router();
const { getJoins, createJoin } = require("../controllers/joinController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getJoins)
  .post(protect, createJoin);

module.exports = router;
