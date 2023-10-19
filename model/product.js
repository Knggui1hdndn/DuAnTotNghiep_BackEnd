const mongoose = require("mongoose");

// Định nghĩa schema cho Product
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  sold: Number,
  sale: Number,
  description: String,
  productDetails: [
    { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductDetail",
     }
  ],
  idCata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

// Định nghĩa schema cho ProductDetail
const productDetailSchema = new mongoose.Schema({
  size: String,
  imageProducts: [
    {
      imageProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImageProduct",
      },
      quantity: Number,
    },
  ],
});

// Định nghĩa schema cho ImageProduct
const imageProductSchema = new mongoose.Schema({
  color: String,
  image: String,
});

// Tạo model Product
const ImageProduct = mongoose.model("ImageProduct", imageProductSchema);
const Product = mongoose.model("Product", productSchema);
const ProductDetail = mongoose.model("ProductDetail", productDetailSchema);

module.exports = { Product, ProductDetail, ImageProduct };
