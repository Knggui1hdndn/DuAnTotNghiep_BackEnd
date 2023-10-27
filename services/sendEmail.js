const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const OtpEmail = require("../model/otpEmail.js");

dotenv.config();

// Tạo đối tượng transporter để gửi email
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "nguyenduykhang2992003@gmail.com",
    pass: "wulm nixz scvs wlrk",
  },
  debug: true,
  logger: true,
});

const sendOtpEmail = expressAsyncHandler(async (email,res) => {
  try {
    const otp = parseInt(Math.random() * 100000);
    const newOtpEmail = await OtpEmail.create({
      email: email,
      otp: otp,
      timeCreateAt: Date.now(),
    });

    const mailOptions = {
      from: '"Ứng dụng bán quần áo nam" nguyenduykhang2992003@gmail.com',
      to: email, // Gửi đến địa chỉ email được gửi trong yêu cầu
      subject: "OTP form Callback Coding",
      text: "Your OTP is: " + otp,
    };

    if (newOtpEmail) {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Lỗi khi gửi email" }); // Trả về lỗi nếu có lỗi trong quá trình gửi email
        } else {
          console.log("Email gửi thành công!");
          res.status(200).json({ message: "Email đã được gửi thành công!" }); // Trả về thành công nếu email được gửi thành công
        }
      });
    } else {
      res.status(500).json({ error: "Lỗi khi gửi email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi gửi email" }); // Trả về lỗi nếu có lỗi trong quá trình xử lý yêu cầu
  }
});
const verifyOTPEmail = async (email, otp,res) => {
  // Sửa từ req.body.address thành req.body.email
  const otpEmail = await OtpEmail.findOneAndDelete({ email: email, otp: otp });
  if (otpEmail) {
    res.status(200).json({ message: "Verification Success" });
  } else {
    res.status(200).json({ error: "Verification Failed" });
  }
};

module.exports = { sendOtpEmail, verifyOTPEmail };
