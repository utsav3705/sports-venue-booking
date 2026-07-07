const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Venue name is required"], trim: true },
    sport: { type: String, required: [true, "Sport type is required"] },
    area: { type: String, required: [true, "Area is required"] },
    address: { type: String, required: [true, "Address is required"] },
    pricePerHour: { type: Number, required: [true, "Price per hour is required"], min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
    amenities: { type: [String], default: [] },
    openTime: { type: String, required: [true, "Opening time is required"] },
    closeTime: { type: String, required: [true, "Closing time is required"] },
    availableSlots: { type: [String], default: [] },
    // Owner reference — set automatically on creation
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", VenueSchema);
