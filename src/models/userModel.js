const mongoose = require("mongoose");
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  originalTransactionId: {
    type: String,
  },
  autoRenewProductId: {
    type: String,
  },
  productId: {
    type: String,
  },
  autoRenewStatus: {
    type: Number,
  },
  renewalPrice: {
    type: Number,
  },
  currency: {
    type: String,
  },
  signedDate: {
    type: Number,
  },
  environment: {
    type: String,
  },
  recentSubscriptionStartDate: {
    type: Number,
  },
  renewalDate: {
    type: Number,
  },
  transactionId: {
    type: String,
  },
  webOrderLineItemId: {
    type: String,
  },
  bundleId: {
    type: String,
  },
  subscriptionGroupIdentifier: {
    type: String,
  },
  purchaseDate: {
    type: Number,
  },
  originalPurchaseDate: {
    type: Number,
  },
  expiresDate: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  type: {
    type: String,
  },
  inAppOwnershipType: {
    type: String,
  },
  transactionReason: {
    type: String,
  },
  storefront: {
    type: String,
  },
  storefrontId: {
    type: String,
  },
  price: {
    type: Number,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
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
