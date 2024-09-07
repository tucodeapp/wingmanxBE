const express = require("express");
const {
  getCurrentUser,
  loginUser,
  registerUser,
  receiveNotifications,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/currentUser", protect, getCurrentUser);
router.post("/nofications", receiveNotifications);

module.exports = router;
