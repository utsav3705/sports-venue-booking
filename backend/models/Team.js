const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
    trim: true,
  },
  sport: {
    type: String,
    required: [true, "Sport is required"],
  },
  description: {
    type: String,
    default: "",
  },
  logo: {
    type: String,
    default: "",
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  maxMembers: {
    type: Number,
    default: 11,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Team", TeamSchema);
