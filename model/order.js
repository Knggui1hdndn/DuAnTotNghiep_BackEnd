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
    doc.intoMoney = update.$set.quantity * doc.price * (1-doc.sale / 100);
    await doc.save();
    console.log(this.quantity + "sđ");
  }
  next();
});
 
detailOrderSchema.set("strictPopulate", false);
const payments = {
  TRANSFER: "Transfer",
  CASH: "Cash",
  VIRTUAL: "Virtual",
};

const status = {
  WAIT_FOR_CONFIRMATION: "Wait for confirmation",
  CONFIRMED:"Confirmed",
  DELIVERING: "Delivering",
  DELIVERED: "Delivered",
  CANCEL: "Cancel",
  RETURNS: "Returns",
  HOLLOW: "Hollow"
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
  name:String,
  address:String,
  phoneNumber:String,
  description:String,
  totalAmount: Number,
  isPay: {
    type:Boolean,
    default:false
  },
  payments: {
    type: String,
    enum: Object.values(payments), // Sử dụng giá trị của enum TypeFeeling
    default: payments.VIRTUAL,
  },
  status:  {
    type: String,
    enum: Object.values(status), // Sử dụng giá trị của enum TypeFeeling
    default: status.HOLLOW,
  },
}
)
// Tạo model Product
const Order = mongoose.model("Order", orderSchema);
const DetailOrder = mongoose.model("DetailOrder", detailOrderSchema);

module.exports = {
  Order,
  DetailOrder,
  payments,status
};
