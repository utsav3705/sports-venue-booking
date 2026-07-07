const express = require("express");
const router = express.Router();
const {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");
const { protect, venueOwner } = require("../middleware/authMiddleware");

// Public-read routes — any authenticated user can view venues
router.get("/", protect, getVenues);
router.get("/:id", protect, getVenueById);

// Write routes — only venue_owner or admin role allowed
router.post("/", protect, venueOwner, createVenue);
router.put("/:id", protect, venueOwner, updateVenue);
router.delete("/:id", protect, venueOwner, deleteVenue);

module.exports = router;
