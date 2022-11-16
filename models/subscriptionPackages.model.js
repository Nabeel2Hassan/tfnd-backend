const mongoose = require("mongoose");

var SubscriptionPackageSchema = mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, required: true }, // popular, very popular, most popular
  months: { type: String, required: true },
  type: { type: String, required: true }, // monthly , lifetime,
  price: { type: String, required: true },
  currency: { type: String, required: true }
});

var subscriptionPackage = mongoose.model("SubscriptionPackage", SubscriptionPackageSchema);

module.exports = subscriptionPackage;
// title: "Basic Package",
//     desc: "Subscibe today and enjoy unlimited feartures seamleslly",
//     heading: "popular",
//     months: '01',
//     type: 'Monthly',
//     price: "$ 100.00"