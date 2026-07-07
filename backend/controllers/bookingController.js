const Booking = require("../models/Booking");

const getBookings = async (req, res) => {
  const { username, venueId } = req.query;
  try {
    let query = {};
    if (venueId) {
      query.venueId = venueId;
    } else if (username && username !== "admin") {
      query.username = username;
    }
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return res.status(500).json({ error: "Server error fetching bookings" });
  }
};

const createBooking = async (req, res) => {
  const { venueName, sport, area, date, slots, amount, userName, userPhone, username, venueId } = req.body;
  
  if (!venueName || !date || !slots || !slots.length) {
    return res.status(400).json({ error: "Venue, date, and slots are required." });
  }

  try {
    // Prevent double booking: Check if any slots are already reserved at this venue on the same date
    if (venueId) {
      const existingBookings = await Booking.find({ venueId, date });
      const takenSlots = existingBookings.flatMap((b) => b.slots);
      const isOverlap = slots.some((s) => takenSlots.includes(s));
      if (isOverlap) {
        return res.status(400).json({ error: "One or more selected slots are already booked. Please choose another time." });
      }
    }

    const booking = await Booking.create({
      venueName,
      sport,
      area,
      date,
      slots,
      amount,
      userName,
      userPhone,
      username: username || req.user?.email || req.user?.name || "guest",
      venueId: venueId || null,
    });
    return res.status(201).json(booking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ error: "Server error creating booking" });
  }
};

const deleteBooking = async (req, res) => {
  const { booking_id } = req.params;
  try {
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Players can only cancel their own bookings (admins can cancel any)
    const requestUsername = req.user?.username || req.user?.email;
    if (req.user?.role !== "admin" && booking.username !== requestUsername) {
      return res.status(403).json({ error: "Not authorized to cancel this booking." });
    }

    await Booking.findByIdAndDelete(booking_id);
    return res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({ error: "Server error deleting booking" });
  }
};

module.exports = { getBookings, createBooking, deleteBooking };


