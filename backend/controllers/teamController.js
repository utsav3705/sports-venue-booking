const Team = require("../models/Team");

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({});
    return res.json(teams);
  } catch (error) {
    console.error("Fetch Teams Error:", error);
    return res.status(500).json({ error: "Server error fetching teams" });
  }
};

const createTeam = async (req, res) => {
  const { name, sport, area, level, members, maxMembers, avatar, captain, description, wins, losses, lookingFor } = req.body;
  try {
    const team = await Team.create({
      name,
      sport,
      area,
      level,
      members,
      maxMembers,
      avatar,
      captain,
      description,
      wins,
      losses,
      lookingFor,
    });
    return res.status(201).json(team);
  } catch (error) {
    console.error("Create Team Error:", error);
    return res.status(500).json({ error: "Server error creating team" });
  }
};

module.exports = { getTeams, createTeam };
