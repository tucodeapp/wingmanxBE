const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define subscription schema
const subscriptionSchema = new Schema({
  originalTransactionId: String,
  autoRenewProductId: String,
  productId: String,
  autoRenewStatus: Number,
  renewalPrice: Number,
  currency: String,
  signedDate: Number,
  environment: String,
  recentSubscriptionStartDate: Number,
  renewalDate: Number,
  transactionId: String,
  webOrderLineItemId: String,
  bundleId: String,
  subscriptionGroupIdentifier: String,
  purchaseDate: Number,
  originalPurchaseDate: Number,
  expiresDate: Number,
  quantity: Number,
  type: String,
  inAppOwnershipType: String,
  transactionReason: String,
  storefront: String,
  storefrontId: String,
  price: Number,
});

// Define user schema with subscription as an embedded document
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
  },
  {
    timestamps: true,
  }
);

const UserSchema = mongoose.model("User", userSchema);

module.exports = {
  UserSchema,
};
