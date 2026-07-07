const express = require("express");
const router = express.Router();
const { getTeams, createTeam } = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(getTeams)
  .post(protect, createTeam);

module.exports = router;
