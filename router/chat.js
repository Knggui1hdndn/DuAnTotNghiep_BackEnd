const express = require("express");
const router = express.Router();
const ChatController = require("../controler/ChatControler.js");
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/chat"); // Định nghĩa thư mục lưu trữ
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const newFileName = `${timestamp}${fileExtension}`;
      cb(null, newFileName);
    },
  }),
});

router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/")
  .get(ChatController.getListChat)
  .post(upload.array("images"),ChatController.addImage)
  module.exports=router