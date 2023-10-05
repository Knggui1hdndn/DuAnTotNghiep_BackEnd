const mongoose = require('mongoose');

// Định nghĩa schema cho Product
const productSchema = new mongoose.Schema({
  _id: String,
  name: String,
  image: String,
  price: String,
  sold: String,
  sale: String,
  idCata: String,
});

// Tạo model Product
const Product = mongoose.model('Product', productSchema);

module.exports = Product;