//@ts-nocheck

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { UserSchema as User } from "../models/userModel";

// @desc   Register new user
// @route  POST /api/users
// @access Public

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate information
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all necessary information!");
  }

  // Check if user exits
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({
      message: "User already exists. Please try again",
      success: false,
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      success: true,
      message: "User has been created",
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({
      message: "Invalid user data. Please try again",
      success: false,
    });
  }
});

// @desc   Authenticate a user
// @route  POST /api/users/login
// @access Public

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      success: true,
      message: "Logged in successfully",
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({
      message: "Invalid credentials. Please try again",
      success: false,
    });
  }
});

// @desc   Get user data
// @route  GET /api/users/currentUser
// @access Private

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Generate JWT

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
