const mongoose = require("mongoose");

var vouchersSchema = mongoose.Schema({
    bussiness_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
  },
  title: { type: String },
  code:  { type: String },
  image: { type: String },
  type : { type: String },
  value: { type: Number },
  current_status: { type: String },
  allowed_users_count: { type: Number }
});

var voucherModel = mongoose.model("Voucher", vouchersSchema);

module.exports = voucherModel;
