const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  venueName: { type: String, required: true },
  sport:     { type: String, required: true },
  area:      { type: String, required: true },
  date:      { type: String, required: true },
  slots:     { type: [String], required: true },
  amount:    { type: Number, required: true },
  userName:  { type: String, required: true },
  userPhone: { type: String, required: true },
  username:  { type: String, required: true },
  // Optional link to the Venue document — enables owner booking view
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
