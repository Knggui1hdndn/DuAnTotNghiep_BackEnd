const mongoose = require("mongoose");
const payScheme = new mongoose.Schema({
   idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
  idOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", // Tham chiếu đến model User
  },
  totalAmount:Number,
  url:String,
  note: String,
  timeCreateAt: {
    type: Number,
    default: Date.now(),
  },
  expiration: {
    type: Number,
    default: function () {
       return this.timeCreateAt +( 30 * 60 * 1000);
    },
  },
  timeCurrent:{
    type: Number,
    default: Date.now(),
  },
});
 const PayQR = mongoose.model("PayQR", payScheme);

module.exports = PayQR;
