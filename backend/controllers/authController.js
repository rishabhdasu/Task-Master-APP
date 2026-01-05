const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate Token

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  //   Validation Check
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    // Check if existing user
    const userExists = await User.exists({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create User
    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });
    return res.status(200).json({
      id: user._id,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in registering user", error: error.message });
  }
};

// Login

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    return res.status(200).json({
      id: user._id,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

// Get All User Info

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.body.user.id).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

// Update User

exports.updateUser = async (req, res) => {
  const { fullName, password, profileImageUrl } = req.body;
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (fullName) {
      user.fullName = fullName;
    }
    if (profileImageUrl) {
      user.profileImageUrl = profileImageUrl;
    }
    if (password) {
      user.password = password;
    }
    await user.save();
    res.status(200).json({
      message: "User details updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};
