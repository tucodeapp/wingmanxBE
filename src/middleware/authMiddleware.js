const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { UserSchema: User } = require("../models/userModel");
const env = require("../utils/validateEnv");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Get user from token
      //@ts-ignore
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log(error);

      res.status(401).json({
        success: false,
        message: "Not authorised",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorised. No token",
    });
  }
});

module.exports = {
  protect,
};
