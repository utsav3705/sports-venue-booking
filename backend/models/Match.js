const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  fromTeam: { type: String, required: true },
  toTeam: { type: String, required: true },
  toAvatar: { type: String },
  sport: { type: String, required: true },
  matchType: { type: String, enum: ["friendly", "competitive"], default: "friendly" },
  stake: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  username: { type: String, required: true }
});

module.exports = mongoose.model("Match", MatchSchema);
