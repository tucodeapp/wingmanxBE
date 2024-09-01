import express from "express";
import {
  forgetPassword,
  getCurrentUser,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/currentUser", protect, getCurrentUser);

export default router;
