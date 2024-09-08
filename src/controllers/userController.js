const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { UserSchema: User } = require("../models/userModel");
const axios = require("axios");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Please add all necessary information!",
    });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      message: "User already exists. Please try again",
      success: false,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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
  } else {
    res.status(400).json({
      message: "Invalid user data. Please try again",
      success: false,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

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

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const receiveNotifications = async (req, res) => {
  try {
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

      const decodedRenewalInfo = jwt.decode(signedRenewalInfo, {
        complete: true,
      });
      const renewalInfoPayload = decodedRenewalInfo.payload;

      await User.findOneAndUpdate(
        {
          "subscription.originalTransactionId":
            transactionInfoPayload.originalTransactionId,
        },
        {
          $set: {
            subscription: {
              "subscription.latestTransaction": transactionInfoPayload,
              "subscription.latestRenewalInfo": renewalInfoPayload,
            },
          },
        },
        { new: true, upsert: true }
      );

      res.status(200);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error("Error handling notification:", error);
    res.status(500).send("Internal Server Error.");
  }
};

const validateReceipt = asyncHandler(async (req, res) => {
  const { receipt, userEmail } = req.body;

  if (!receipt || !userEmail) {
    return res.status(400).json({ message: "Missing receipt or user ID" });
  }

  const response = await axios.post(
    "https://sandbox.itunes.apple.com/verifyReceipt",
    {
      "receipt-data": receipt,
      password: "ac06543ca9d44f6086d600cb40246693",
    }
  );

  const { original_transaction_id } = response.data.latest_receipt_info.sort(
    (a, b) => Number(b.expires_date_ms) - Number(a.expires_date_ms)
  )[0];

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        "subscription.originalTransactionId": original_transaction_id,
        "subscription.isIntroOfferPeriodExpired": true,
        "subscription.isUserSubscribedToIAP": true,
      },
    },
    { new: true, upsert: true }
  );

  res
    .status(200)
    .json({ message: "Subscription updated", status: response.data.status });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  receiveNotifications,
  validateReceipt,
};
