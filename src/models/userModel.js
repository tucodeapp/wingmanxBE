const mongoose = require("mongoose");
const { Schema } = mongoose;

const subscriptionSchema = new Schema(
  {
    originalTransactionId: {
      type: String,
      default: "",
    },
    isIntroOfferPeriodExpired: {
      type: Boolean,
      default: false,
    },
    isSubscriptionExpired: {
      type: Boolean,
      default: false,
    },
    isUserSubscribedToIAP: {
      type: Boolean,
      default: false,
    },
    latestTransaction: {
      type: Schema.Types.Mixed,
    },
    latestRenewalInfo: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    subscription: {
      type: subscriptionSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const UserSchema = mongoose.model("User", userSchema);

module.exports = {
  UserSchema,
};
