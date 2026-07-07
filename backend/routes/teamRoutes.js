const express = require("express");
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  requestToJoin,
  resolveJoinRequest,
  removeMember,
  leaveTeam,
} = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(getTeams)
  .post(protect, createTeam);

router.route("/:id")
  .get(getTeamById)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.post("/:id/request", protect, requestToJoin);
router.post("/:id/resolve", protect, resolveJoinRequest);
router.post("/:id/remove", protect, removeMember);
router.post("/:id/leave", protect, leaveTeam);

module.exports = router;
