const mongoose = require('mongoose');

// Định nghĩa schema cho class Category
const categorySchema = new mongoose.Schema({
   category: String,
});

// Tạo model Category
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
