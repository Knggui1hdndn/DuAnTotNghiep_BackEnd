const mongoose = require('mongoose');

// Định nghĩa schema cho class Category
const categorySchema = new mongoose.Schema({
  _id: String,
  category: String,
});

// Tạo model Category
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
