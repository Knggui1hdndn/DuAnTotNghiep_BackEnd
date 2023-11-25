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
      { name, address, phoneNumber, email, avatar: filePath },
      { new: true }
    );
    res.status(201).send(userNew);
  } catch (error) {
    res.status(400).json({ error: "Server error" });
  }
};

const searchProduct = async (req, res, next) => {
  try {
    const { name, skip } = req.query;

    const data = await Product.find({ name: { $regex: name, $options: "i" } })
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
      .limit(10)
      .skip(skip);
    console.error(data);

    res.json(data);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const NotificationControler = require("./Notification");
const TokenFcm = require("../model/tokenFcm");

const generateQrPay = async (req, res, next) => {
  const { idOrder } = req.query;
  const now = Date.now();
  const idUser = req.user._id;
  const paymentType = payments.TRANSFER;
  try {
    // Find and update the order
    const order = await Order.findOneAndUpdate(
      { _id: idOrder },
      { status: status.WAIT_FOR_CONFIRMATION },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ error: "An error occurred. Please try again" });
    }
    var payQr = await PayQR.findOne({
      idOrder: order._id,
      idUser: idUser,
    });
    if (payQr != null) {
      if (payQr.expiration < Date.now()) {
        const currentTime = Date.now();
        const expirationTime = currentTime + 30 * 60 * 1000; // 30 minutes in milliseconds
        payQr = await PayQR.findOneAndUpdate(
          { _id: payQr._id },
          { timeCreateAt: currentTime, expiration: expirationTime },
          { new: true, upsert: true }
        );
      await  scheduleOrderExp(payQr, idOrder);
      }
    }
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
      await  scheduleOrderExp(savedPayQR, idOrder);
      return res.status(200).json(savedPayQR);
    }
    payQr.timeCurrent = Date.now();
    console.log("ook nhe" + payQr);

    return res.status(200).json(payQr);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Server error" });
  }
};
async function scheduleOrderExp(payQr, idOrder) {
  const job = schedule.scheduleJob(payQr.expiration, async () => {
    const existingQR = await Order.findByIdAndUpdate(
      {
        _id: idOrder,
      },
      { status: status.CANCEL },
      { new: true }
    );

    const findTokenFcm = await TokenFcm.findOne({ idUser: existingQR.idUser });

    NotificationControler.sendNotification(
      findTokenFcm.token,
      {
        url: "https://www.logolynx.com/images/logolynx/23/23938578fb8d88c02bc59906d12230f3.png",
        title: "Payment",
        body: "Your order was canceled due to unpaid payment",
      },
      findTokenFcm.idUser
    );
  });
}
module.exports = { generateQrPay, searchProduct, updateProfile };
