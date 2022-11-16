const mongoose = require("mongoose");

var businessSchema = mongoose.Schema({
  name: { type: String, required: true },
  discount: { type: Number },
  description: { type: String },
  date: { type: String },
  image: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  liveFlag: { type: Boolean },
  // live: { type: Boolean, default: false },
});

var businessModel = mongoose.model("Business", businessSchema);

module.exports = businessModel;
