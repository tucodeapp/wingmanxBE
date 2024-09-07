const express = require("express");
const {
  confirmEmail,
  forgetPassword,
  getCurrentUser,
  loginUser,
  registerUser,
  resetPassword,
  receiveNotifications,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/confirm-email/:token", confirmEmail);
router.get("/currentUser", protect, getCurrentUser);
router.post("/nofications", receiveNotifications);

module.exports = router;
