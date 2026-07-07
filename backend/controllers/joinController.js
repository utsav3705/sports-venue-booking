const Join = require("../models/Join");

const getJoins = async (req, res) => {
  const { username } = req.query;
  try {
    const query = username && username !== "admin" ? { username } : {};
    const joins = await Join.find(query);
    return res.json(joins);
  } catch (error) {
    console.error("Fetch Joins Error:", error);
    return res.status(500).json({ error: "Server error fetching join requests" });
  }
};

const createJoin = async (req, res) => {
  const { teamName, teamAvatar, sport, username } = req.body;
  try {
    const join = await Join.create({
      teamName,
      teamAvatar,
      sport,
      status: "pending",
      username: username || req.user?.email || req.user?.name || "guest",
    });
    // Simulate background auto-approval/rejection
    setTimeout(async () => {
      try {
        const statusOutcome = Math.random() > 0.35 ? "accepted" : "rejected";
        await Join.findByIdAndUpdate(join._id, { status: statusOutcome });
      } catch (err) {
        console.error("Error auto-resolving join status:", err);
      }
    }, 5000);
    return res.status(201).json(join);
  } catch (error) {
    console.error("Create Join Error:", error);
    return res.status(500).json({ error: "Server error creating join request" });
  }
};

module.exports = { getJoins, createJoin };
