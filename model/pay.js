const mongoose = require("mongoose");
const payScheme = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
  idOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", // Tham chiếu đến model Order
  },
  totalAmount: Number,
  url: String,
  note: String,
  timeCreatedAt: {
    type: Number,
    default: function () {
      return Date.now();
    },
  },
  expiration: {
    type: Number,
    default: function () {
      return Date.now() + 30 * 60 * 1000;
    },
  },
  timeCurrent: {
    type: Number,
    default: Date.now(),
  },
});

 

 const PayQR = mongoose.model("PayQR", payScheme);

module.exports = PayQR;
