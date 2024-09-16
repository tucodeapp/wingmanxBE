const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const Notification = require("../models/notificationModel");

const path = require("path");

const admin = require("firebase-admin");

exports.registerNotification = asyncHandler(async (req, res, next) => {
  const { user, tokenID } = req.body;

  const objID = mongoose.Types.ObjectId.isValid(user)
    ? mongoose.Types.ObjectId(user)
    : null;

  if (!objID) {
    console.log("Invalid user id");
  }
  const obj = await Notification.findOne({ user: user });

  if (obj)
    return res.status(200).json({
      status: "success",
      data: {
        message: "Token already registered!",
      },
    });

  return factory.createOne(Notification)(req, res, next);
});

exports.updateNotification = asyncHandler(async (req, res, next) => {
  const userID = req?.query?.userid;

  const objID = mongoose.Types.ObjectId.isValid(userID)
    ? mongoose.Types.ObjectId(userID)
    : null;

  if (!objID) {
    console.log("User not found");
  }

  const obj = await Notification.findOne({ user: userID });

  if (!obj) {
    console.log("Document not found");
  }

  req.params.id = obj._id;
  return factory.updateOne(Notification)(req, res, next);
});

exports.sendNotification = asyncHandler(async (req, res, next) => {
  try {
    const { title, body, navigate, tokenID, image, user, data } = req.body;

    const obj = await Notification.findOne({ user: user });

    if (!obj) {
      return next(console.log("No Such User with Notifications Object Found"));
    }

    const notification = {
      title: title ? title : "Results Are Ready!",
      body: body ? body : "Click here to view your results",
      data: {
        navigate: navigate ? navigate : "Xray",
        image: image ? image : "default",
        data: data ? data : null,
      },
      android: {
        smallIcon: "logo_circle",
        channelId: "default",
        importance: 4,
        pressAction: {
          id: "default",
        },
        actions: [
          {
            title: "Mark as Read",
            pressAction: {
              id: "read",
            },
          },
        ],
      },
    };

    obj.notifications.push(notification);
    await obj.save();

    await admin.messaging().sendMulticast({
      tokens: [tokenID],
      data: {
        notifee: JSON.stringify(notification),
      },
    });

    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { user } = req.query;

  const objID = mongoose.Types.ObjectId.isValid(user)
    ? mongoose.Types.ObjectId(user)
    : null;

  if (!objID) {
    console.log("Invalid user id");
  }

  const obj = await Notification.findOne({ user: user });

  if (!obj) {
    console.log("No Such User with Notifications Object Found");
  }

  return res.status(200).json({
    status: "success",
    obj,
  });
});
