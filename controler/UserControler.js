 const mongoose = require("mongoose");
const PayQR = require("../model/pay");
const Product = require("../model/product");
const GenerateOtp = require("../services/generateOtp");
const schedule = require("node-schedule"); // Thêm "schedule"
const { error } = require("console");
const { Order, DetailOrder, payments } = require("../model/order");

const searchProduct = async (req, res, next) => {
  const { name, skip } = req.query;
  Product.find({ name: { $regex: name, $options: "i" } })
    .limit(10) // Giới hạn số lượng mục
    .skip(skip) // Bỏ qua số lượng mục
    .exec((err, data) => {
      if (err) {
        console.error("Lỗi khi truy vấn dữ liệu:", err);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
      } else {
        res.json(data); // Trả về kết quả tìm kiếm dữ liệu
      }
    });
};

const generateQrPay = async (req, res, next) => {
  const { idOrder } = req.query;

  // Define and initialize variables
  const idUser = req.user._id; // Assuming this is the correct user ID
   const paymentType = payments.VIRTUAL // Replace with the correct payment type

  try {
    // Find and update the order
    const order = await Order.findOneAndUpdate({
      _id:idOrder,
      idUser: req.user._id,
      isPay: false,
      payments: paymentType,
    }, { $set: { payments: payments.CASH, createAt: Date.now() } },{new:true});

    if (!order) {
      return res.status(404).json({ error: 'An error occurred. Please try again' });
    }

    // Replace with the actual URL for generating QR code
    const qrDataURL = `https://api.vietqr.io/image/970415-113366668888-wjFfwx6.jpg?amount=${order.totalAmount}&accountNo=0867896418&accountName=NGUYEN DUY KHANG&acqId=970418&addInfo=${order.note}`;

    const newPayQR = new PayQR({
      idOrder:new  mongoose.Types.ObjectId(idOrder),
      idUser: idUser,
      note: GenerateOtp.generator(), // Make sure GenerateOtp is defined and returns the expected value
      url: qrDataURL,
    });

    const savedPayQR = await newPayQR.save();

    // Schedule job to remove PayQR
    const job = schedule.scheduleJob(savedPayQR.expiration, async () => {
      const existingQR = await PayQR.findOne({ _id: savedPayQR._id });
      if (existingQR) {
        await existingQR.remove();
      }
    });
    console.log(savedPayQR)

    res.status(200).json(savedPayQR );
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { generateQrPay,searchProduct };
 