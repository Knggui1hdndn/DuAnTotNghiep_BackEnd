const mongoose = require("mongoose");

const detailOrderSchema = new mongoose.Schema({
  idOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  idImageProductQuantity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ImageQuantity",
  },
  size: String,
  quantity: Number,
  sale: Number,
  price: Number,
  intoMoney: Number,
  isSelected:{
    type:Boolean,
    default:false,
     
  }  
  
});
detailOrderSchema.set('strictPopulate', false);
const payments = {
  TRANSFER: "Transfer",
  CASH: "Cash",
  VIRTUAL: "Virtual",
};
const orderSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createAt: {
    type: Number,
    default: Date.now(),
  },
  totalAmount: String,
  isPay: Boolean,
  payments: {
    type: String,
    enum: Object.values(payments), // Sử dụng giá trị của enum TypeFeeling
    default: payments.VIRTUAL,
  },
  status:String
});

// Tạo model Product
const Order = mongoose.model("Order", orderSchema);
const DetailOrder = mongoose.model("DetailOrder", detailOrderSchema);

module.exports = {
  Order,
  DetailOrder,
  payments,
};
