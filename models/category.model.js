const mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  associatedTo: { type: String },
  description: { type: String },
  type: {type :Number} // 1=>business, 2=> events
  // live: { type: Boolean, default: false },
});

var categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
