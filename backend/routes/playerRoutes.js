const express = require("express");
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  sendConnectionRequest,
  resolveConnectionRequest,
  removeConnection,
} = require("../controllers/playerController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getPlayers);

router.route("/:id")
  .get(protect, getPlayerById);

router.post("/:id/connect", protect, sendConnectionRequest);
router.delete("/:id/connect", protect, removeConnection);
router.post("/:id/resolve-connect", protect, resolveConnectionRequest);

module.exports = router;
