const Connect = require("../models/Connect");

const getConnects = async (req, res) => {
  const { username } = req.query;
  try {
    const query = username && username !== "admin" ? { username } : {};
    const connects = await Connect.find(query);
    return res.json(connects);
  } catch (error) {
    console.error("Fetch Connects Error:", error);
    return res.status(500).json({ error: "Server error fetching connection requests" });
  }
};

const createConnect = async (req, res) => {
  const { playerName, playerAvatar, sport, area, username } = req.body;
  try {
    const connect = await Connect.create({
      playerName,
      playerAvatar,
      sport,
      area,
      status: "pending",
      username: username || req.user?.email || req.user?.name || "guest",
    });
    // Simulate background auto-approval/rejection
    setTimeout(async () => {
      try {
        const statusOutcome = Math.random() > 0.35 ? "accepted" : "rejected";
        await Connect.findByIdAndUpdate(connect._id, { status: statusOutcome });
      } catch (err) {
        console.error("Error auto-resolving connect status:", err);
      }
    }, 5000);
    return res.status(201).json(connect);
  } catch (error) {
    console.error("Create Connect Error:", error);
    return res.status(500).json({ error: "Server error creating connection request" });
  }
};

module.exports = { getConnects, createConnect };
