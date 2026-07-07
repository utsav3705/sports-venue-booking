const Venue = require("../models/Venue");

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (venue_owner | admin)
const createVenue = async (req, res) => {
  const {
    name, sport, area, address, pricePerHour,
    image, amenities, openTime, closeTime, availableSlots,
  } = req.body;

  // Required field validation
  if (!name || !sport || !area || !address || !pricePerHour || !openTime || !closeTime) {
    return res.status(400).json({ error: "Please provide all required fields: name, sport, area, address, pricePerHour, openTime, closeTime" });
  }

  try {
    const venue = await Venue.create({
      name,
      sport,
      area,
      address,
      pricePerHour,
      image: image || "",
      amenities: amenities || [],
      openTime,
      closeTime,
      availableSlots: availableSlots || [],
      owner: req.user._id,   // set owner to the logged-in user
    });

    return res.status(201).json(venue);
  } catch (error) {
    console.error("Create Venue Error:", error);
    return res.status(500).json({ error: "Server error while creating venue" });
  }
};

// @desc    Get all venues (with optional filters)
// @route   GET /api/venues?sport=cricket&area=Bopal
// @access  Public (any authenticated user)
const getVenues = async (req, res) => {
  try {
    const filter = {};
    if (req.query.sport) filter.sport = req.query.sport;
    if (req.query.area)  filter.area  = req.query.area;

    const venues = await Venue.find(filter).populate("owner", "name email");
    return res.status(200).json(venues);
  } catch (error) {
    console.error("Fetch Venues Error:", error);
    return res.status(500).json({ error: "Server error fetching venues" });
  }
};

// @desc    Get single venue by ID
// @route   GET /api/venues/:id
// @access  Public (any authenticated user)
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate("owner", "name email");

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    return res.status(200).json(venue);
  } catch (error) {
    console.error("Fetch Venue Error:", error);
    return res.status(500).json({ error: "Server error fetching venue" });
  }
};

// @desc    Update a venue
// @route   PUT /api/venues/:id
// @access  Private (owner of the venue | admin)
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    // Ownership check: admin can update any venue; owner can only update their own
    const isAdmin = req.user.role === "admin";
    const isOwner = venue.owner && venue.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not authorized. You can only update your own venues." });
    }

    // Apply updates (only allow permitted fields)
    const allowed = [
      "name", "sport", "area", "address", "pricePerHour",
      "image", "amenities", "openTime", "closeTime", "availableSlots",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        venue[field] = req.body[field];
      }
    });

    const updated = await venue.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Venue Error:", error);
    return res.status(500).json({ error: "Server error while updating venue" });
  }
};

// @desc    Delete a venue
// @route   DELETE /api/venues/:id
// @access  Private (owner of the venue | admin)
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    // Ownership check: admin can delete any venue; owner can only delete their own
    const isAdmin = req.user.role === "admin";
    const isOwner = venue.owner && venue.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not authorized. You can only delete your own venues." });
    }

    await venue.deleteOne();
    return res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Delete Venue Error:", error);
    return res.status(500).json({ error: "Server error while deleting venue" });
  }
};

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
};
