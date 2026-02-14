const jwt = require("jsonwebtoken");
const { matchedData } = require("express-validator");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res) => {
  const data = matchedData(req);
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const role = ["student", "leader"].includes(data.role) ? data.role : "student";

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role,
    interests: data.interests || [],
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests },
  });
};

const login = async (req, res) => {
  const data = matchedData(req);
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests },
  });
};

const me = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests },
  });
};

module.exports = { register, login, me };
