import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/userController";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/currentUser", getCurrentUser);

export default router;
