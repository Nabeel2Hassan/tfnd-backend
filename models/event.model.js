const mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  venue: { type: String },
  cost: { type: Number },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  address: { type: String },
  date: { type: String },
  image: { type: String },
  from_timestamp: { type : Date },
  to_timestamp: { type : Date },
  website_url: { type: String },
  liveFlag: { type: Boolean },
  location_id: { type: String },
  longitude: { type: String },
  latitude: { type: String }
});

var eventModel = mongoose.model("Event", eventSchema);

module.exports = eventModel;
