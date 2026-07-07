const mongoose = require("mongoose");

const JoinSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  teamAvatar: { type: String },
  sport: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  username: { type: String, required: true }
});

module.exports = mongoose.model("Join", JoinSchema);
