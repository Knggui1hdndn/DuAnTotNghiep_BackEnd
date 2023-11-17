const express = require("express");
const router = express.Router();
const EvaluateControler = require("../controler/EvaluateControler");
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");

const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/evaluate"); // Định nghĩa thư mục lưu trữ
      },
      filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const timestamp = Date.now();
        const newFileName = `${req.user._id+timestamp}${fileExtension}`;
        console.log("New Filename:", newFileName);
        cb(null, newFileName);
      },
    }),
  });

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/:idProduct")
  .post(upload.array("avatars", 5), EvaluateControler.addEvaluates)
  .get(EvaluateControler.getEvaluates);
router.route("/:idEvaluate").delete(EvaluateControler.deleteEvaluates);
router
  .route("/:idEvaluate/feeling")
  .post(EvaluateControler.handelFeelingEvaluates);

module.exports = router;
