const Match = require("../models/Match");
const Notification = require("../models/Notification");

// @desc    Get all public matches
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({})
      .populate("owner", "name email phone profileImage")
      .populate("joinedPlayers", "name email phone profileImage sport")
      .populate("venue");
    return res.json(matches);
  } catch (error) {
    console.error("Fetch Matches Error:", error);
    return res.status(500).json({ error: "Server error fetching matches" });
  }
};

// @desc    Get single match by ID
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("owner", "name email phone profileImage")
      .populate("joinedPlayers", "name email phone profileImage sport")
      .populate("venue");
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    return res.json(match);
  } catch (error) {
    console.error("Fetch Match Error:", error);
    return res.status(500).json({ error: "Server error fetching match details" });
  }
};

// @desc    Create a public match
// @route   POST /api/matches
// @access  Private
const createMatch = async (req, res) => {
  const { sport, venue, date, time, skillLevel, requiredPlayers, description } = req.body;

  if (!sport || !venue || !date || !time || !skillLevel || !requiredPlayers) {
    return res.status(400).json({ error: "Please provide all required fields" });
  }

  try {
    const match = await Match.create({
      sport,
      venue,
      date,
      time,
      skillLevel,
      requiredPlayers: Number(requiredPlayers),
      description: description || "",
      owner: req.user._id,
      joinedPlayers: [req.user._id],
    });

    const populated = await Match.findById(match._id)
      .populate("owner", "name email phone profileImage")
      .populate("joinedPlayers", "name email phone profileImage sport")
      .populate("venue");

    return res.status(201).json(populated);
  } catch (error) {
    console.error("Create Match Error:", error);
    return res.status(500).json({ error: "Server error creating match" });
  }
};

// @desc    Join public match
// @route   POST /api/matches/:id/join
// @access  Private
const joinMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.joinedPlayers.includes(req.user._id)) {
      return res.status(400).json({ error: "You have already joined this match" });
    }

    if (match.joinedPlayers.length >= match.requiredPlayers) {
      return res.status(400).json({ error: "Match is already full" });
    }

    match.joinedPlayers.push(req.user._id);
    await match.save();

    // Create Notification to host (owner)
    if (match.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: match.owner,
        type: "Match Joined",
        message: `${req.user.name} joined your match on ${match.date} at ${match.time}`,
        relatedId: match._id.toString(),
      });
    }

    const populated = await Match.findById(match._id)
      .populate("owner", "name email phone profileImage")
      .populate("joinedPlayers", "name email phone profileImage sport")
      .populate("venue");

    return res.json(populated);
  } catch (error) {
    console.error("Join Match Error:", error);
    return res.status(500).json({ error: "Server error joining match" });
  }
};

// @desc    Leave public match
// @route   POST /api/matches/:id/leave
// @access  Private
const leaveMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Hosts cannot leave their own match. Cancel the match instead." });
    }

    if (!match.joinedPlayers.includes(req.user._id)) {
      return res.status(400).json({ error: "You are not a participant in this match" });
    }

    match.joinedPlayers = match.joinedPlayers.filter((p) => p.toString() !== req.user._id.toString());
    await match.save();

    const populated = await Match.findById(match._id)
      .populate("owner", "name email phone profileImage")
      .populate("joinedPlayers", "name email phone profileImage sport")
      .populate("venue");

    return res.json(populated);
  } catch (error) {
    console.error("Leave Match Error:", error);
    return res.status(500).json({ error: "Server error leaving match" });
  }
};

// @desc    Cancel match
// @route   DELETE /api/matches/:id
// @access  Private (Owner only)
const cancelMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only the host can cancel this match" });
    }

    // Notify all participants except host
    const notifications = match.joinedPlayers
      .filter((pId) => pId.toString() !== match.owner.toString())
      .map((pId) => ({
        user: pId,
        type: "Match Cancelled",
        message: `The match you joined on ${match.date} was cancelled by the host.`,
        relatedId: match._id.toString(),
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await match.deleteOne();
    return res.json({ message: "Match cancelled successfully" });
  } catch (error) {
    console.error("Cancel Match Error:", error);
    return res.status(500).json({ error: "Server error cancelling match" });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  cancelMatch,
};
