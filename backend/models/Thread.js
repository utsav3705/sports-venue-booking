const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true }
});

const ThreadSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  playerAvatar: { type: String },
  sport: { type: String, required: true },
  messages: { type: [MessageSchema], default: [] },
  username: { type: String, required: true }
});

module.exports = mongoose.model("Thread", ThreadSchema);
