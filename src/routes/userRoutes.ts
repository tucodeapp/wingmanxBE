import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/currentUser", protect, getCurrentUser);

export default router;
