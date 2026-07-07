const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  position: { type: String, required: true },
  area: { type: String, required: true },
  level: { type: String, required: true },
  avatar: { type: String }
});

module.exports = mongoose.model("Player", PlayerSchema);
