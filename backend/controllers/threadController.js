const Thread = require("../models/Thread");

const getThreads = async (req, res) => {
  const { username } = req.query;
  try {
    const query = username && username !== "admin" ? { username } : {};
    const threads = await Thread.find(query);
    return res.json(threads);
  } catch (error) {
    console.error("Fetch Threads Error:", error);
    return res.status(500).json({ error: "Server error fetching threads" });
  }
};

const createMessage = async (req, res) => {
  const { playerName, playerAvatar, sport, messageText, username } = req.body;
  const user_name_val = username || req.user?.email || req.user?.name || "guest";
  const my_msg = {
    from: "me",
    text: messageText,
    time: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  try {
    let thread = await Thread.findOne({ playerName, username: user_name_val });
    if (thread) {
      thread.messages.push(my_msg);
      await thread.save();
    } else {
      thread = await Thread.create({
        playerName,
        playerAvatar,
        sport,
        messages: [my_msg],
        username: user_name_val,
      });
    }
    return res.status(201).json(thread);
  } catch (error) {
    console.error("Create Thread/Message Error:", error);
    return res.status(500).json({ error: "Server error creating message" });
  }
};

module.exports = { getThreads, createMessage };
