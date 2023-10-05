const mongoose = require('mongoose');

// Định nghĩa schema cho class Notification
const tokenFcmSchema = new mongoose.Schema({
  _id: String,
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  token: String,
});

// Tạo model Notification
const TokenFcm = mongoose.model('TokenFcm', tokenFcmSchema);

module.exports = TokenFcm;
