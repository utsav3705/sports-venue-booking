const express = require("express");
const router = express.Router();
const { getBookings, createBooking, deleteBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getBookings)
  .post(protect, createBooking);

router.route("/:booking_id")
  .delete(protect, deleteBooking);

module.exports = router;
