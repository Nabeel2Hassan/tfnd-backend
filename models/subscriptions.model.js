const mongoose = require("mongoose");

var subscriptionsSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  subscription_package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPackage",
  },
  from_date: { type: Date },
  to_date:  { type: Date },
  purchased_on: { type: Date },
  purchase_method : { type: String },
  opening_balance: { type: Number },
  amount: { type: Number },
  arrears: { type: String },
  current_status: { type: String }
});

var subscriptionModel = mongoose.model("Subscription", subscriptionsSchema);

module.exports = subscriptionModel;
