 const mongoose = require("mongoose");
const PayQR = require("../model/pay");
const Product = require("../model/product");
const GenerateOtp = require("../services/generateOtp");
const schedule = require("node-schedule"); // Thêm "schedule"
const { error } = require("console");

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
  const { idOrder, totalAmount } = req.body;
  const qrDataURL = `https://api.vietqr.io/image/970415-113366668888-wjFfwx6.jpg?amount=${totalAmount}&accountNo=0867896418&accountName=NGUYEN DUY KHANG&acqId=970418&addInfo=${savedPayQR.note}`;

  const newPayQR = new PayQR({
    idOrder: mongoose.Types.ObjectId(idOrder), // Sử dụng mongoose.Types.ObjectId
    idUser: req.user._id,
    note: GenerateOtp.generator(),
    url: qrDataURL,
  });

  try {
    const savedPayQR = await newPayQR.save();
    if (savedPayQR) {
      const job = schedule.scheduleJob(savedPayQR.expiration, async () => {
        const existingQR = await PayQR.findOne({ _id: savedPayQR._id });
        if (existingQR) {
          await existingQR.remove();
        }
      });
      res.status(200).json({ savedPayQR });
    } else {
      res.status(500).json({ error: "Error sever" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { generateQrPay,searchProduct };
 