const Team = require("../models/Team");
const Notification = require("../models/Notification");

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate("captain", "name email phone profileImage")
      .populate("members", "name email phone profileImage sport");
    return res.json(teams);
  } catch (error) {
    console.error("Fetch Teams Error:", error);
    return res.status(500).json({ error: "Server error fetching teams" });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("captain", "name email phone profileImage")
      .populate("members", "name email phone profileImage sport");
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    return res.json(team);
  } catch (error) {
    console.error("Fetch Team Error:", error);
    return res.status(500).json({ error: "Server error fetching team details" });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Players)
const createTeam = async (req, res) => {
  const { teamName, sport, description, logo, maxMembers } = req.body;
  if (!teamName || !sport) {
    return res.status(400).json({ error: "Team name and sport are required" });
  }

  try {
    const team = await Team.create({
      teamName,
      sport,
      description: description || "",
      logo: logo || "",
      captain: req.user._id,
      members: [req.user._id],
      maxMembers: Number(maxMembers) || 11,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("captain", "name email phone profileImage")
      .populate("members", "name email phone profileImage sport");

    return res.status(201).json(populatedTeam);
  } catch (error) {
    console.error("Create Team Error:", error);
    return res.status(500).json({ error: "Server error creating team" });
  }
};

// @desc    Update a team
// @route   PUT /api/teams/:id
// @access  Private (Captain only)
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only the captain can modify team details" });
    }

    const { teamName, sport, description, logo, maxMembers } = req.body;
    if (teamName) team.teamName = teamName;
    if (sport) team.sport = sport;
    if (description !== undefined) team.description = description;
    if (logo !== undefined) team.logo = logo;
    if (maxMembers) {
      if (Number(maxMembers) < team.members.length) {
        return res.status(400).json({ error: "Cannot reduce max members below current roster size" });
      }
      team.maxMembers = Number(maxMembers);
    }

    await team.save();
    const populated = await Team.findById(team._id)
      .populate("captain", "name email phone profileImage")
      .populate("members", "name email phone profileImage sport");

    return res.json(populated);
  } catch (error) {
    console.error("Update Team Error:", error);
    return res.status(500).json({ error: "Server error updating team" });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Captain only)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only the captain can delete the team" });
    }

    await team.deleteOne();
    return res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete Team Error:", error);
    return res.status(500).json({ error: "Server error deleting team" });
  }
};

// @desc    Join Request, Accept, Reject, Leave Team functionality
// @route   POST /api/teams/:id/request
// @access  Private
const requestToJoin = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.members.includes(req.user._id)) {
      return res.status(400).json({ error: "You are already a member of this team" });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ error: "Team is already full" });
    }

    // Check if there is already a pending Join Request notification for this team from this user
    const pendingRequest = await Notification.findOne({
      user: team.captain,
      type: "Team Join Request",
      relatedId: team._id.toString(),
      message: { $regex: req.user.name }
    });

    if (pendingRequest) {
      return res.status(400).json({ error: "You have already requested to join this team" });
    }

    // Create Team Join Request notification to the captain
    await Notification.create({
      user: team.captain,
      type: "Team Join Request",
      message: `${req.user.name} requested to join your team ${team.teamName}`,
      relatedId: team._id.toString(),
    });

    return res.json({ message: "Join request sent to team captain" });
  } catch (error) {
    console.error("Join Request Error:", error);
    return res.status(500).json({ error: "Server error sending join request" });
  }
};

// @desc    Accept or Reject Join Request
// @route   POST /api/teams/:id/resolve
// @access  Private (Captain only)
const resolveJoinRequest = async (req, res) => {
  const { playerId, action } = req.body; // action: 'accept' | 'reject'
  if (!playerId || !action) {
    return res.status(400).json({ error: "Player ID and action are required" });
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only the captain can resolve requests" });
    }

    // Find and remove matching notification
    await Notification.deleteMany({
      user: team.captain,
      type: "Team Join Request",
      relatedId: team._id.toString(),
      message: { $regex: playerId } // We can also match by content or just generic clean
    });

    if (action === "accept") {
      if (team.members.includes(playerId)) {
        return res.status(400).json({ error: "Player is already a member" });
      }
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({ error: "Team is already full" });
      }
      team.members.push(playerId);
      await team.save();

      // Notify player
      await Notification.create({
        user: playerId,
        type: "Team Request Accepted",
        message: `Your request to join ${team.teamName} was accepted!`,
        relatedId: team._id.toString(),
      });
    } else {
      // Notify player
      await Notification.create({
        user: playerId,
        type: "Team Request Rejected",
        message: `Your request to join ${team.teamName} was declined.`,
        relatedId: team._id.toString(),
      });
    }

    const populated = await Team.findById(team._id)
      .populate("captain", "name email phone profileImage")
      .populate("members", "name email phone profileImage sport");

    return res.json(populated);
  } catch (error) {
    console.error("Resolve Join Error:", error);
    return res.status(500).json({ error: "Server error resolving join request" });
  }
};

// @desc    Remove member from team
// @route   POST /api/teams/:id/remove
// @access  Private (Captain only)
const removeMember = async (req, res) => {
  const { playerId } = req.body;
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.captain.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only the captain can remove members" });
    }

    if (playerId === team.captain.toString()) {
      return res.status(400).json({ error: "Cannot remove the captain" });
    }

    team.members = team.members.filter((m) => m.toString() !== playerId);
    await team.save();

    return res.json({ message: "Member removed from team roster" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    return res.status(500).json({ error: "Server error removing member" });
  }
};

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.captain.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Captains cannot leave. Delete the team or transfer captaincy first." });
    }

    if (!team.members.includes(req.user._id)) {
      return res.status(400).json({ error: "You are not a member of this team" });
    }

    team.members = team.members.filter((m) => m.toString() !== req.user._id.toString());
    await team.save();

    return res.json({ message: "You left the team" });
  } catch (error) {
    console.error("Leave Team Error:", error);
    return res.status(500).json({ error: "Server error leaving team" });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  requestToJoin,
  resolveJoinRequest,
  removeMember,
  leaveTeam,
};
