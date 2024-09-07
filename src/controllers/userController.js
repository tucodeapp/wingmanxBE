//@ts-nocheck

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { UserSchema: User } = require("../models/userModel");
const nodemailer = require("nodemailer");

// @desc   Register new user
// @route  POST /api/users/register
// @access Public

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  console.log(name, email, password);

  // Validate information
  if (!name || !email || !password) {
    res.status(400).json({
      error: "Please add all necessary information!",
    });
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
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      success: true,
      message: "User has been created",
      token,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "arturasnetzet@gmail.com",
        pass: "vlbx bzaq paun bkkl",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Please confirm your email",
      html: `<h1>Confirm your password</h1>
    <p>Click on the following link to Confirm your password:</p>
    <a href="http://localhost:5001/confirm-email/${token}">http://localhost:5001/confirm-email/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a confirm email, please ignore this email.</p>`,
    };

    try {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.status(200).send({
          message: "Confirmation link sent to your email",
          success: true,
        });
      });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
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

// @desc   Send a password reset link
// @route  POST /api/users/forgetPassword
// @access Public

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({
      message: "No account associated with this email",
      success: false,
    });
  }

  const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arturasnetzet@gmail.com",
      pass: "vlbx bzaq paun bkkl",
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Reset Password",
    html: `<h1>Reset Your Password</h1>
  <p>Click on the following link to reset your password:</p>
  <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
  <p>The link will expire in 10 minutes.</p>
  <p>If you didn't request a password reset, please ignore this email.</p>`,
  };

  try {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res
        .status(200)
        .send({ message: "Reset link sent to your email", success: true });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// @desc   Reset password
// @route  POST /api/users/resetPassword:token
// @access Private

export const resetPassword = async (req, res) => {
  // Logic for reset password
};

// @desc   Sent confirm email
// @route  GET /api/users/confirm-email/:token
// @access Public

export const confirmEmail = async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);

    const user = await User.findByIdAndUpdate(id, { isVerified: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Email confirmed successfully", success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
