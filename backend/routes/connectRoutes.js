const express = require("express");
const router = express.Router();
const { getConnects, createConnect } = require("../controllers/connectController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getConnects)
  .post(protect, createConnect);

module.exports = router;
