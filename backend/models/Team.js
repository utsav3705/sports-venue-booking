const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  area: { type: String, required: true },
  level: { type: String, required: true },
  members: { type: Number, default: 1 },
  maxMembers: { type: Number, default: 11 },
  avatar: { type: String },
  captain: { type: String, required: true },
  description: { type: String },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  lookingFor: { type: String }
});

module.exports = mongoose.model("Team", TeamSchema);
