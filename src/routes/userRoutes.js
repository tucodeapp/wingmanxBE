const express = require("express");
const {
  confirmEmail,
  forgetPassword,
  getCurrentUser,
  loginUser,
  registerUser,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/confirm-email/:token", confirmEmail);
router.get("/currentUser", protect, getCurrentUser);

export default router;
