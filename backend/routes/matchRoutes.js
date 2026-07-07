const express = require("express");
const router = express.Router();
const {
  getMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  cancelMatch,
} = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getMatches)
  .post(protect, createMatch);

router.get("/:id", protect, getMatchById);

router.post("/:id/join", protect, joinMatch);
router.post("/:id/leave", protect, leaveMatch);
router.delete("/:id", protect, cancelMatch);

module.exports = router;
