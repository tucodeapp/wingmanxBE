const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define subscription schema
const subscriptionSchema = new Schema(
  {
    originalTransactionId: {
      type: String,
      default: undefined,
    },
    isIntroOfferPeriodExpired: {
      type: Boolean,
      default: false,
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
