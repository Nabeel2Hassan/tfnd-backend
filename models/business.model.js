const mongoose = require("mongoose");

var businessSchema = mongoose.Schema({
  name: { type: String, required: true },
  discount: { type: Number },
  description: { type: String },
  date: { type: String },
  image: { type: String },
  mode: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  ratings: {
    rated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    rated: { type: Number },
    rated_at: { type : Date },
  },
  liveFlag: { type: Boolean },
  is_featured: { type: Boolean},
  address: { type: String },
  location_id: { type: String },
  longitude: { type: String },
  latitude: { type: String },
  website_url: { type: String }
});

var businessModel = mongoose.model("Business", businessSchema);

module.exports = businessModel;
