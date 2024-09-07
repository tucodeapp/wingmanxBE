//@ts-nocheck

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { UserSchema: User } = require("../models/userModel");
const nodemailer = require("nodemailer");

// @desc   Register new user
// @route  POST /api/users/register
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  console.log(name, email, password);

  // Validate information
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Please add all necessary information!",
    });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Please confirm your email",
      html: `<h1>Confirm your email</h1>
    <p>Click on the following link to confirm your email:</p>
    <a href="${process.env.FRONTEND_URL}/confirm-email/${token}">${process.env.FRONTEND_URL}/confirm-email/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>`,
    };

    try {
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.status(200).send({
          message: "Confirmation link sent to your email ",
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

const loginUser = asyncHandler(async (req, res) => {
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

const getCurrentUser = asyncHandler(async (req, res) => {
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

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "No account associated with this email",
      success: false,
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Reset Password",
    html: `<h1>Reset Your Password</h1>
  <p>Click on the following link to reset your password:</p>
  <a href="${process.env.FRONTEND_URL}/reset-password/${token}">${process.env.FRONTEND_URL}/reset-password/${token}</a>
  <p>The link will expire in 10 minutes.</p>
  <p>If you didn't  request this please ignore this email.</p>`,
  };

  try {
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({
        message: "Reset link sent to your email",
        success: true,
      });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// @desc   Reset password
// @route  POST /api/users/resetPassword/:token
// @access Private

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// @desc   Confirm email
// @route  GET /api/users/confirm-email/:token
// @access Public

const confirmEmail = asyncHandler(async (req, res) => {
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
});

const receiveNotifications = async (req, res) => {
  try {
    // Parse the JSON data from the request body
    const notificationData = req.body;

    const decoded = jwt.decode(notificationData.signedPayload, {
      complete: true,
    });

    const { signedTransactionInfo, signedRenewalInfo } = decoded?.payload?.data;

    if (signedTransactionInfo && signedRenewalInfo) {
      const decodedTransactionInfo = jwt.decode(signedTransactionInfo, {
        complete: true,
      });
      const transactionInfoPayload = decodedTransactionInfo.payload;

      // Decode signedRenewalInfo (contains auto-renewal status and related info)
      const decodedRenewalInfo = jwt.decode(signedRenewalInfo, {
        complete: true,
      });
      const renewalInfoPayload = decodedRenewalInfo.payload;

      // Extract key info from decoded payloads
      const originalTransactionId =
        transactionInfoPayload.originalTransactionId;
      const transactionId = transactionInfoPayload.transactionId;
      const productId = transactionInfoPayload.productId;
      const purchaseDate = transactionInfoPayload.purchaseDate;
      const expiresDate = renewalInfoPayload.expiresDate; // If you want to track expiration

      // Log the extracted information for debugging
      console.log(`Original Transaction ID: ${originalTransactionId}`);
      console.log(`Transaction ID: ${transactionId}`);
      console.log(`Product ID: ${productId}`);
      console.log(`Purchase Date: ${purchaseDate}`);
      console.log(`Expires Date: ${expiresDate}`);

      // Find the user in the database using the originalTransactionId
      const user = await User.findOneAndUpdate(
        { originalTransactionId }, // Find the user by the originalTransactionId stored when subscription was first created
        {
          $set: {
            // Update the user's subscription details
            "subscription.productId": productId,
            "subscription.transactionId": transactionId,
            "subscription.purchaseDate": purchaseDate,
            "subscription.expiresDate": expiresDate,
          },
        },
        { new: true, upsert: true } // Create a new entry if no matching user found (upsert)
      );

      res.status(200);
    } else {
      res.status(400);
    }

    // Send the HTML response
  } catch (error) {
    console.error("Error handling notification:", error);
    res.status(500).send("Internal Server Error.");
  }
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  confirmEmail,
  forgetPassword,
  getCurrentUser,
  receiveNotifications,
};
