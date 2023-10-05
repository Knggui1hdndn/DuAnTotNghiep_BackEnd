const mongoose = require('mongoose');

// Định nghĩa schema cho class Evaluate
const evaluateSchema = new mongoose.Schema({
  _id: String,
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Tham chiếu đến model Product
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  star: String,
  comment: String,
  url: [String],
});

// Tạo model Evaluate
const Evaluate = mongoose.model('Evaluate', evaluateSchema);

module.exports = Evaluate;
