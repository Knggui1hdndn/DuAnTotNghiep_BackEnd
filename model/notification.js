const mongoose = require('mongoose');

// Định nghĩa schema cho class Notification
const notificationSchema = new mongoose.Schema({
  _id: String,
  idSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  idReceve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến model User
  },
  url: String,
  title: String,
  body: String,
  createAt: Number, // Sử dụng kiểu dữ liệu số nguyên cho thời gian
});

// Tạo model Notification
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
