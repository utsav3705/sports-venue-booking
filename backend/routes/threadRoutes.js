const express = require("express");
const router = express.Router();
const { getThreads, createMessage } = require("../controllers/threadController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getThreads)
  .post(protect, createMessage);

module.exports = router;
