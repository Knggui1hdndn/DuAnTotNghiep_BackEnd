 
const mongoose = require('mongoose');

const otpEmailSchema = new mongoose.Schema({
   email: String,
  otp: Number,
  timeCreateAt: {
    type: Number,
    default: Date.now(),  
  },
  expiration: {
    type: Number,
    default: function () {
       return this.timeCreateAt + (2 * 60 * 1000);  
    },
  },
});

// Tạo model Notification
const OtpEmail = mongoose.model('OtpEmail', otpEmailSchema);

module.exports = OtpEmail;
