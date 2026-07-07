const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  sport: {
    type: String,
    required: true,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  skillLevel: {
    type: String,
    required: true,
  },
  requiredPlayers: {
    type: Number,
    required: true,
  },
  joinedPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  description: {
    type: String,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Match", MatchSchema);
