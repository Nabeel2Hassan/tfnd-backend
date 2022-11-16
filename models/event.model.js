const mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  venue: { type: String },
  cost: { type: Number },
  address: { type: String },
  date: { type: String },
  image: { type: String },
  liveFlag: { type: Boolean },
});

var eventModel = mongoose.model("Event", eventSchema);

module.exports = eventModel;
