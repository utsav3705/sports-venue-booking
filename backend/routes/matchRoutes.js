const express = require("express");
const router = express.Router();
const { getMatches, createMatch } = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getMatches)
  .post(protect, createMatch);

module.exports = router;
