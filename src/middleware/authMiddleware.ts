import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { UserSchema as User } from "../models/userModel";
import env from "../utils/validateEnv";

export const protect = asyncHandler(async (req, res, next) => {
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
