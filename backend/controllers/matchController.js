const Match = require("../models/Match");

const getMatches = async (req, res) => {
  const { username } = req.query;
  try {
    const query = username && username !== "admin" ? { username } : {};
    const matches = await Match.find(query);
    return res.json(matches);
  } catch (error) {
    console.error("Fetch Matches Error:", error);
    return res.status(500).json({ error: "Server error fetching matches" });
  }
};

const createMatch = async (req, res) => {
  const { fromTeam, toTeam, toAvatar, sport, matchType, stake, username } = req.body;
  try {
    const match = await Match.create({
      fromTeam,
      toTeam,
      toAvatar,
      sport,
      matchType,
      stake: Number(stake) || 0,
      status: "pending",
      username: username || req.user?.email || req.user?.name || "guest",
    });
    // Simulate background auto-approval/rejection
    setTimeout(async () => {
      try {
        const statusOutcome = Math.random() > 0.35 ? "accepted" : "rejected";
        await Match.findByIdAndUpdate(match._id, { status: statusOutcome });
      } catch (err) {
        console.error("Error auto-resolving match status:", err);
      }
    }, 5000);
    return res.status(201).json(match);
  } catch (error) {
    console.error("Create Match Error:", error);
    return res.status(500).json({ error: "Server error creating match challenge" });
  }
};

module.exports = { getMatches, createMatch };
