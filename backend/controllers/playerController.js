const Player = require("../models/Player");

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({});
    return res.json(players);
  } catch (error) {
    console.error("Fetch Players Error:", error);
    return res.status(500).json({ error: "Server error fetching players" });
  }
};

const createPlayer = async (req, res) => {
  const { name, sport, position, area, level, avatar } = req.body;
  try {
    const player = await Player.create({
      name,
      sport,
      position,
      area,
      level,
      avatar,
    });
    return res.status(201).json(player);
  } catch (error) {
    console.error("Create Player Error:", error);
    return res.status(500).json({ error: "Server error creating player profile" });
  }
};

module.exports = { getPlayers, createPlayer };
