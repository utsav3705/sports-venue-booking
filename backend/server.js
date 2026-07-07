const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

// Load Env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware - CORS must be before routes
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Models for seeding
const Venue = require("./models/Venue");
const Player = require("./models/Player");
const Team = require("./models/Team");
const User = require("./models/User");

// Seed functions
const seedDatabase = async () => {
  try {
    // 1. Seed Venues
    const venueCount = await Venue.countDocuments();
    if (venueCount === 0) {
      const seedVenues = [
        {
          name: "Arena Cricket Hub",
          sport: "cricket",
          area: "Satellite",
          address: "Near Shivranjani Cross Road, Satellite, Ahmedabad",
          pricePerHour: 800,
          rating: 4.7,
          reviewCount: 124,
          image: "/venues/cricket-turf.png",
          amenities: ["Floodlights", "Parking", "Changing Room", "Canteen", "First Aid"],
          openTime: "06:00",
          closeTime: "23:00",
          availableSlots: ["06:00", "07:00", "08:00", "16:00", "17:00", "19:00", "20:00", "21:00"]
        },
        {
          name: "GreenField Cricket Turf",
          sport: "cricket",
          area: "Bopal",
          address: "Bopal-Ghuma Road, Bopal, Ahmedabad",
          pricePerHour: 700,
          rating: 4.5,
          reviewCount: 89,
          image: "/venues/cricket-turf.png",
          amenities: ["Floodlights", "Parking", "Changing Room", "Drinking Water"],
          openTime: "05:30",
          closeTime: "22:00",
          availableSlots: ["05:30", "06:00", "07:00", "08:00", "18:00", "19:00", "20:00"]
        },
        {
          name: "ProKick Football Arena",
          sport: "football",
          area: "Prahlad Nagar",
          address: "Prahlad Nagar Garden Road, Ahmedabad",
          pricePerHour: 1200,
          rating: 4.8,
          reviewCount: 203,
          image: "/venues/football-turf.png",
          amenities: ["Floodlights", "Valet Parking", "Changing Room", "Canteen", "Shower", "CCTV"],
          openTime: "06:00",
          closeTime: "24:00",
          availableSlots: ["06:00", "07:00", "09:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
        },
        {
          name: "Goal Zone Football Ground",
          sport: "football",
          area: "Vastrapur",
          address: "Vastrapur Lake Road, Vastrapur, Ahmedabad",
          pricePerHour: 1000,
          rating: 4.4,
          reviewCount: 156,
          image: "/venues/football-turf.png",
          amenities: ["Floodlights", "Parking", "Changing Room", "Canteen"],
          openTime: "05:00",
          closeTime: "23:00",
          availableSlots: ["05:00", "06:00", "07:00", "18:00", "19:00", "20:00", "21:00"]
        },
        {
          name: "PickleZone Courts",
          sport: "pickleball",
          area: "Thaltej",
          address: "Thaltej Cross Road, Near S.G. Highway, Ahmedabad",
          pricePerHour: 600,
          rating: 4.9,
          reviewCount: 67,
          image: "/venues/pickleball-court.png",
          amenities: ["Outdoor Courts", "Parking", "Locker Room", "Equipment Rental", "Coach Available"],
          openTime: "06:00",
          closeTime: "22:00",
          availableSlots: ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
        },
        {
          name: "AhmedaBall Pickleball Club",
          sport: "pickleball",
          area: "Bodakdev",
          address: "Judges Bungalow Road, Bodakdev, Ahmedabad",
          pricePerHour: 550,
          rating: 4.6,
          reviewCount: 43,
          image: "/venues/pickleball-court.png",
          amenities: ["Indoor Courts", "Parking", "Changing Room", "Equipment Rental"],
          openTime: "07:00",
          closeTime: "21:00",
          availableSlots: ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"]
        },
        {
          name: "Padel Pro Ahmedabad",
          sport: "padel",
          area: "SG Highway",
          address: "Sola Road, Near S.G. Highway, Ahmedabad",
          pricePerHour: 1500,
          rating: 4.9,
          reviewCount: 38,
          image: "/venues/padel-court.png",
          amenities: ["Glass Courts", "AC Lounge", "Pro Shop", "Coaching", "Parking", "Cafeteria"],
          openTime: "06:00",
          closeTime: "23:00",
          availableSlots: ["06:00", "07:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]
        },
        {
          name: "Navkar Padel Club",
          sport: "padel",
          area: "Chandkheda",
          address: "Chandkheda Char Rasta, Gandhinagar Highway, Ahmedabad",
          pricePerHour: 1200,
          rating: 4.5,
          reviewCount: 29,
          image: "/venues/padel-court.png",
          amenities: ["Glass Courts", "Parking", "Changing Room", "Equipment Rental"],
          openTime: "05:30",
          closeTime: "22:00",
          availableSlots: ["05:30", "06:00", "07:00", "08:00", "18:00", "19:00", "20:00", "21:00"]
        }
      ];
      await Venue.insertMany(seedVenues);
      console.log("Venues seeded successfully!");
    }

    // 2. Seed Players
    const playerCount = await Player.countDocuments();
    if (playerCount === 0) {
      const seedPlayers = [
        {"name": "Riya Shah", "sport": "pickleball", "position": "All-rounder", "area": "Thaltej", "level": "Intermediate", "avatar": "RS"},
        {"name": "Priya Desai", "sport": "padel", "position": "Doubles", "area": "SG Highway", "level": "Pro", "avatar": "PD"},
        {"name": "Rohan Bhatt", "sport": "padel", "position": "Singles", "area": "Bodakdev", "level": "Beginner", "avatar": "RB"},
        {"name": "Siddhi Kapoor", "sport": "pickleball", "position": "Singles & Doubles", "area": "Navrangpura", "level": "Advanced", "avatar": "SK"}
      ];
      await Player.insertMany(seedPlayers);
      console.log("Players seeded successfully!");
    }

    // 3. Seed Teams
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      const seedTeams = [
        {"name": "Satellite Strikers", "sport": "cricket", "area": "Satellite", "level": "Advanced", "members": 6, "maxMembers": 8, "avatar": "SS", "captain": "Arjun Mehta", "description": "Satellite Cricket Club. Looking for 2 Batsmen.", "wins": 23, "losses": 7, "lookingFor": "2 Batsmen"},
        {"name": "Bopal Blasters", "sport": "football", "area": "Bopal", "level": "Intermediate", "members": 8, "maxMembers": 11, "avatar": "BB", "captain": "Dev Patel", "description": "Fun football team playing on weekends.", "wins": 15, "losses": 12, "lookingFor": "Defender and Goalkeeper"}
      ];
      await Team.insertMany(seedTeams);
      console.log("Teams seeded successfully!");
    }

    // 4. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt1 = await bcrypt.genSalt(10);
      const devPassword = await bcrypt.hash("dev", salt1);
      
      const salt2 = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash("admin", salt2);

      const seedUsers = [
        {
          name: "Dev Patel",
          email: "dev@playmates.com",
          phone: "+91 99999 88888",
          password: devPassword,
          role: "user",
          sport: "football"
        },
        {
          name: "System Administrator",
          email: "admin@playmates.com",
          phone: "+91 00000 00000",
          password: adminPassword,
          role: "admin",
          sport: "pickleball"
        }
      ];

      await User.collection.insertMany(seedUsers);
      console.log("Default users seeded successfully!");
    }
  } catch (error) {
    console.error("Database Seeding Error:", error);
  }
};

seedDatabase();

// Route mappings
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/connects", require("./routes/connectRoutes"));
app.use("/api/joins", require("./routes/joinRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/threads", require("./routes/threadRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Port
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
