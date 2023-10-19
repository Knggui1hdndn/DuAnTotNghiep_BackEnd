const mongoose = require("mongoose");

const detailOrderSchema = new mongoose.Schema({
   idProduct: String,
  quantity: Number,
  sale: Number,
  price: Number,
  intoMoney: Number,
});

const orderSchema = new mongoose.Schema({
  _id: String,
  idUser: String,
  createAt: String,
  totalAmount: String,
  detail: [detailOrderSchema], // Sử dụng schema của DetailOrder trong mảng detail
});

// Tạo model Product
const Order = mongoose.model("Order", orderSchema);
const DetailOrder = mongoose.model("DetailOrder", detailOrderSchema);

module.exports = {
  Order,
  DetailOrder,
};
