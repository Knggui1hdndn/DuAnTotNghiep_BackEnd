const mongoose = require("mongoose");
const PayQR = require("../model/pay");
const User = require("../model/user");
const { Product } = require("../model/product");
const GenerateOtp = require("../services/generateOtp");
const schedule = require("node-schedule"); // Thêm "schedule"
const { error } = require("console");
const { Order, DetailOrder, payments, status } = require("../model/order");
const updateProfile = async (req, res, next) => {
  try {
    const host = req.hostname;
    const filePath = req.protocol + "://" + host + "/" + req.file.path;
    console.log(filePath);
    const avatarFile = req.file;
    const name = req.body.name;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const userNew = await User.findOneAndUpdate(
      { _id: req.user._id },
      { name, address, phoneNumber, email, avatar:filePath },
      { new: true }
    );
    res.status(201).send(userNew);
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
};

const searchProduct = async (req, res, next) => {
  try {
    const { name } = req.query;
    const skip = req.query.skip != null ? req.query.skip : 0;

    const data = await Product.find({ name: { $regex: name, $options: "i" } })
    .limit(10)
    .skip(skip)
      .populate({
        path: "productDetails",
        options: { limit: 1 },
         populate: {
          options: { limit: 1 },
          path: "imageProductQuantity",
          populate: {
            path: "imageProduct",
            options: { limit: 1 },
          },
        },
      })
 
      console.error(data);
    res.json(data);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

//danh sách người dùng
const getUser = async (req, res, next) => {
  try{
    const users = await User.find({roleType: "USER"});
    users.unshift({ _id: "", user: "All" });
    res.status(200).json(users);
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
  
};


const generateQrPay = async (req, res, next) => {
  const { idOrder } = req.query;
  const now = Date.now();
  const idUser = req.user._id;
  const paymentType = payments.TRANSFER;
  try {
    // Find and update the order
    const order = await Order.findOne({
      _id: idOrder,
    });

    if (!order) {
      return res
        .status(404)
        .json({ error: "An error occurred. Please try again" });
    }
    const payQr = await PayQR.findOne({
      idOrder:order._id,
      idUser: idUser,
    });
    console.log("ook nhe" + payQr);
    if (payQr == null) {
      const newPayQR = new PayQR({
        idOrder: order._id,
        idUser: idUser,
        note: GenerateOtp.generator(), // Make sure GenerateOtp is defined and returns the expected value
        totalAmount: order.totalAmount,
      });
      const qrDataURL = `https://api.vietqr.io/image/BIDV-0867896418-wjFfwx6.jpg?amount=${order.totalAmount}&accountNo=0867896418&accountName=NGUYEN DUY KHANG&acqId=970418&addInfo=${newPayQR.note}`;
      newPayQR.url = qrDataURL;

      const savedPayQR = await newPayQR.save();

      // Schedule job to remove PayQR
      // const job = schedule.scheduleJob(savedPayQR.expiration, async () => {
      //   const existingQR = await PayQR.findOneAndRemove({
      //     _id: savedPayQR._id,
      //   });
      //   console.log("ook nhe" + existingQR);
      // });
      return res.status(200).json(savedPayQR);
    }
    payQr.timeCurrent = Date.now();
console.log(payQr.timeCurrent)
    return res.status(200).json(payQr);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Server error" });
  }
};

module.exports = { generateQrPay, searchProduct, updateProfile, getUser};
