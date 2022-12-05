const mongoose = require("mongoose");

var vouchersUserSchema = mongoose.Schema({
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  purchased_at: { type: Date }
});

var voucherUserModel = mongoose.model("VoucherUser", vouchersUserSchema);

module.exports = voucherUserModel;
