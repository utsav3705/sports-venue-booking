const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, phone, password, confirmPassword, sport, role } = req.body;

  // Validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: "Please fill in all required fields" });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  // Password length
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  // Password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Duplicate email check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Set role
    let userRole = "user";
    if (role && ["user", "venue_owner", "admin"].includes(role.toLowerCase())) {
      userRole = role.toLowerCase();
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: userRole,
      sport: sport || "football",
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sport: user.sport,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("\n=== LOGIN ATTEMPT ===");
  console.log("req.body:", req.body);
  console.log("email received:", email);
  console.log("password received:", password);

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });

    console.log("user found:", user ? user.email : "NULL");
    console.log("stored hash:", user?.password?.substring(0, 20));

    if (!user) {
      console.log("FAIL: user not found for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    console.log("password match result:", isMatch);

    if (isMatch) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sport: user.sport,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      console.log("FAIL: password mismatch");
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("connections", "name email phone profileImage sport");

    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sport: user.sport,
        profileImage: user.profileImage,
        bio: user.bio,
        favoriteSports: user.favoriteSports,
        connections: user.connections,
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({ error: "Server error while fetching profile" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.sport = req.body.sport || user.sport;
      user.profileImage = req.body.profileImage || user.profileImage;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.favoriteSports = req.body.favoriteSports || user.favoriteSports;

      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const populatedUser = await User.findById(updatedUser._id)
        .populate("connections", "name email phone profileImage sport");

      return res.json({
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        phone: populatedUser.phone,
        role: populatedUser.role,
        sport: populatedUser.sport,
        profileImage: populatedUser.profileImage,
        bio: populatedUser.bio,
        favoriteSports: populatedUser.favoriteSports,
        connections: populatedUser.connections,
        token: generateToken(populatedUser._id),
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({ error: "Server error while updating profile" });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
};
