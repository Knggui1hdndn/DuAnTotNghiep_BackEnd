const mongoose = require("mongoose");
const PayQR = require("../model/pay");
const User = require("../model/user");
const { Product } = require("../model/product");
const GenerateOtp = require("../services/generateOtp");
const schedule = require("node-schedule"); // Thêm "schedule"
const { error } = require("console");
const { updateProductWhenStatusOrder
} = require("../controler/OrderControler");
const NotificationControler = require("../controler/Notification");
const { Order, DetailOrder, payments, status } = require("../model/order");
const updateStatusUser = async (req, res, next) => {
  try {
    if (req.body.status == null) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
    }
    const updatedOrder = await User.findByIdAndUpdate(
      req.query.idUser,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: "Không tìm thấy user." });
    }
    res.status(201).json(updatedOrder);
  } catch (error) {
    console.error("Lỗi khi thêm mã lading:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi server." });
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const host = req.get("host");
    const filePath = req.protocol + "://" + host + "/" + req.file.path;
    console.log(filePath);
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
    const { name } = req.query;
    var { status } = req.query;
    if (status == null) status = true;
    const skip = req.query.skip != null ? req.query.skip : 0;

    const data = await Product.find({
      name: { $regex: name, $options: "i" },
      status: status,
    })
      .limit(10)
      .skip(skip)
      .populate({
        path: "productDetails",
        populate: {
          path: "imageProductQuantity",
          populate: {
            path: "imageProduct",
          },
        },
      });

    console.error(data);
    res.json(data);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
const searchUser = async (req, res, next) => {
  try {
    const { name } = req.query;

    const data = await User.find({
      name: { $regex: name, $options: "i" },
      roleType: "USER",
    });

    console.error(data);
    res.json(data);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
//danh sách người dùng
const getUser = async (req, res, next) => {
  try {
    const users = await User.find({ roleType: "USER" });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getNhanVien = async (req, res, next) => {
  try {
    const users = await User.find({ roleType: "MEMBER" });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const generateQrPay = async (req, res, next) => {
  const { idOrder, recreate } = req.query;
  const now = Date.now();
  const idUser = req.user._id;
  const paymentType = payments.TRANSFER;
  try {
    // Find and update the order
    var order;
    if ( recreate==="false") {
      console.log("recreate1"+recreate)
      order = await Order.findOne({
        _id: idOrder,
      });
    } else {
      console.log("recreate"+recreate)
      order = await Order.findByIdAndUpdate(
        idOrder,
        {
          status: status.WAIT_FOR_CONFIRMATION,
        },
        { new: true }
      );
      await updateProductWhenStatusOrder(
        order._id,
        status.WAIT_FOR_CONFIRMATION
      );
    }
    if (!order) {
      return res
        .status(404)
        .json({ error: "An error occurred. Please try again" });
    }

    const payQr = await PayQR.findOne({
      idOrder: order._id,
      idUser: idUser,
    });
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
      await scheduleOrderExp(
        "Đơn đặt hàng của bạn đã bị hủy do chưa thanh toán"
      );
      return res.status(200).json(savedPayQR);
    }
    payQr.timeCurrent = Date.now();
    return res.status(200).json(payQr);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Server error" });
  }
};
async function scheduleOrderExp(payQr, idOrder, bodyNoti) {
  const job = schedule.scheduleJob(payQr.expiration, async () => {
    const order = await Order.findByIdAndUpdate(
      { _id: idOrder, isPay: false, payments: payments.TRANSFER },
      { status: status.CANCEL },
      { new: true }
    );

    NotificationControler.sendNotification(
      {
        url: "https://www.logolynx.com/images/logolynx/23/23938578fb8d88c02bc59906d12230f3.png",
        title: "Payment",
        body: bodyNoti,
      },
      order.idUser
    );
  });
}
module.exports = {
  searchUser,
  generateQrPay,
  searchProduct,
  updateProfile,
  getUser,
  updateStatusUser,getNhanVien
};
