const mongoose = require("mongoose");

const ConnectSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  playerAvatar: { type: String },
  sport: { type: String, required: true },
  area: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  username: { type: String, required: true }
});

module.exports = mongoose.model("Connect", ConnectSchema);
