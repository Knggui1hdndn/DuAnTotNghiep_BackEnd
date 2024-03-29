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
  isSelected: {
    type: Boolean,
    default: false,
  },
});
detailOrderSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    doc.intoMoney = update.$set.quantity * doc.price * (1 - doc.sale / 100);
    await doc.save();
    console.log(this.quantity + "sđ");
  }
  next();
});

detailOrderSchema.set("strictPopulate", false);
const payments = {
  TRANSFER: "Chuyển khoản",
  CASH: "Tiền mặt",
  VIRTUAL: "Thanh toán điện tử",
};

const status = {
  WAIT_FOR_CONFIRMATION: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCEL: "Hủy",
  RETURNS: "Trả hàng",
  HOLLOW: "Rỗng",
};

const orderSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  confirmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default:null
  },
  createAt: {
    type: Number,
    default: Date.now(),
  },
  name: String,
  address: String,
  phoneNumber: String,
  description: String,
  totalAmount: Number,
  codeOrders: {
    type: String,
    default: function generateCodeOrder() {
      const randomNumber = Math.floor(Math.random() * Date.now()) + 1;
      const randomString = String(randomNumber);
      return "MS" + randomString;
    },
  },
  isPay: {
    type: Boolean,
    default: false,
  },
  payments: {
    type: String,
    enum: Object.values(payments), // Sử dụng giá trị của enum TypeFeeling
    default: payments.VIRTUAL,
  },
  status: {
    type: String,
    enum: Object.values(status), // Sử dụng giá trị của enum TypeFeeling
    default: status.HOLLOW,
  },
  ladingCode: String,
});
// Tạo model Product
const Order = mongoose.model("Order", orderSchema);
const DetailOrder = mongoose.model("DetailOrder", detailOrderSchema);

module.exports = {
  Order,
  DetailOrder,
  payments,
  status,
};
