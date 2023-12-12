const express = require("express");
const router = express.Router();
const UserControler = require("../controler/UserControler");
const path = require("path");
const passport = require("passport");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/avatar"); // Định nghĩa thư mục lưu trữ
    },
    filename: function (req, file, cb) {
      const newFileName = req.user._id + path.extname(file.originalname); // Đổi tên tệp
      cb(null, newFileName);
    },
  }),
});

//const passportConfig = require('../middelwares/passport.js')
router.use(passport.authenticate("jwt", { session: false }));
router.route("/generate/QR").get(UserControler.generateQrPay);
router.route("/search").get(UserControler.searchProduct);
router.route("/").put(UserControler.updateStatusUser).get(UserControler.searchUser);
router
  .route("/editaccount")
  .post(upload.single("avatar"), UserControler.updateProfile);

router.route("/listUser").get(UserControler.getUser);
module.exports = router;
