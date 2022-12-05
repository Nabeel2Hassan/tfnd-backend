const mongoose = require("mongoose");

// const Schema = mongoose.Schema;
var UserSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: { type: String, required: true },
  phoneNo: { type: String },
  userType: { type: Number, required: true, default: 1 }, // 1=> simple user
  image: { type: mongoose.Schema.Types.Mixed },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage" },
  joined_date: { type : Date },
  stripe_customer_id: { type: String },
  credit_card_secret: { type: String },
  credit_card_title: { type: String },
  credit_card_first_four: { type: String },
  credit_card_last_four: { type: String },
  credit_card_exp_month: { type: Number },
  credit_card_exp_year: { type: Number },
  credit_card_brand: { type: String },
  resetToken: { type: String },
  resetExpire: { type: Date }
});

var userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
