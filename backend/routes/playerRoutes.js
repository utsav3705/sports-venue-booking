const express = require("express");
const router = express.Router();
const { getPlayers, createPlayer } = require("../controllers/playerController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(getPlayers)
  .post(protect, createPlayer);

module.exports = router;
