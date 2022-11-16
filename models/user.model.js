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
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPackage" }

});

var userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
