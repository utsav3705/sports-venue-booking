const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all users (players list)
// @route   GET /api/players
// @access  Private
const getPlayers = async (req, res) => {
  try {
    const players = await User.find({ role: "user" }).select("-password");
    return res.json(players);
  } catch (error) {
    console.error("Fetch Players Error:", error);
    return res.status(500).json({ error: "Server error fetching players" });
  }
};

// @desc    Get single player profile by ID
// @route   GET /api/players/:id
// @access  Private
const getPlayerById = async (req, res) => {
  try {
    const player = await User.findOne({ _id: req.params.id, role: "user" }).select("-password");
    if (!player) {
      return res.status(404).json({ error: "Player profile not found" });
    }
    return res.json(player);
  } catch (error) {
    console.error("Fetch Player Error:", error);
    return res.status(500).json({ error: "Server error fetching player profile" });
  }
};

// @desc    Send Connection Request
// @route   POST /api/players/:id/connect
// @access  Private
const sendConnectionRequest = async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user._id.toString()) {
    return res.status(400).json({ error: "You cannot connect with yourself" });
  }

  try {
    const targetPlayer = await User.findById(targetId);
    if (!targetPlayer) {
      return res.status(404).json({ error: "Target player not found" });
    }

    if (req.user.connections.includes(targetId)) {
      return res.status(400).json({ error: "You are already connected with this player" });
    }

    // Check if there is already a pending connection request notification
    const pendingRequest = await Notification.findOne({
      user: targetId,
      type: "Connection Request",
      relatedId: req.user._id.toString()
    });

    if (pendingRequest) {
      return res.status(400).json({ error: "Connection request already pending" });
    }

    await Notification.create({
      user: targetId,
      type: "Connection Request",
      message: `${req.user.name} sent you a connection request!`,
      relatedId: req.user._id.toString(),
    });

    return res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Connection Request Error:", error);
    return res.status(500).json({ error: "Server error sending connection request" });
  }
};

// @desc    Resolve Connection Request (Accept/Reject)
// @route   POST /api/players/:id/resolve-connect
// @access  Private
const resolveConnectionRequest = async (req, res) => {
  const senderId = req.params.id; // Sender of the request
  const { action } = req.body; // 'accept' | 'reject'

  if (!action) {
    return res.status(400).json({ error: "Action is required" });
  }

  try {
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    // Delete matching request notification
    await Notification.deleteMany({
      user: req.user._id,
      type: "Connection Request",
      relatedId: senderId,
    });

    if (action === "accept") {
      if (!req.user.connections.includes(senderId)) {
        req.user.connections.push(senderId);
        await req.user.save();
      }

      if (!sender.connections.includes(req.user._id)) {
        sender.connections.push(req.user._id);
        await sender.save();
      }

      // Notify sender
      await Notification.create({
        user: senderId,
        type: "Connection Accepted",
        message: `${req.user.name} accepted your connection request!`,
        relatedId: req.user._id.toString(),
      });
    }

    return res.json({ message: `Connection request ${action}ed` });
  } catch (error) {
    console.error("Resolve Connection Error:", error);
    return res.status(500).json({ error: "Server error resolving connection request" });
  }
};

// @desc    Remove Connection
// @route   DELETE /api/players/:id/connect
// @access  Private
const removeConnection = async (req, res) => {
  const targetId = req.params.id;
  try {
    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: "Target player not found" });
    }

    req.user.connections = req.user.connections.filter((id) => id.toString() !== targetId);
    await req.user.save();

    target.connections = target.connections.filter((id) => id.toString() !== req.user._id.toString());
    await target.save();

    return res.json({ message: "Connection removed" });
  } catch (error) {
    console.error("Remove Connection Error:", error);
    return res.status(500).json({ error: "Server error removing connection" });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  sendConnectionRequest,
  resolveConnectionRequest,
  removeConnection,
};
