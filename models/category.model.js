const mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  associatedTo: { type: String },
  description: { type: String },
  // live: { type: Boolean, default: false },
});

var categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
