const express = require("express");
const {
  sendNotification,
  getNotifications,
  registerNotification,
  updateNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/send", sendNotification);

router
  .route("/")
  .get(getNotifications)
  .post(registerNotification)
  .patch(updateNotification);

module.exports = router;
