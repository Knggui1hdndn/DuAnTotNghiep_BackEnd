const express = require("express");
const router = express.Router();
const ProductControler = require("../controler/ProductControler");
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/product"); // Định nghĩa thư mục lưu trữ
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const newFileName = `${req.user._id + timestamp}${fileExtension}`;
      cb(null, newFileName);
    },
  }),
});

router.use(passport.authenticate("jwt", { session: false }));
router.route("/search").get(ProductControler.searchProduct);
router
.route("/visibility")
.put(ProductControler.visibilityProduct)
router.route("/categories").get(ProductControler.getCategories);
router
  .route("/")
  .get(ProductControler.getProducts)
  .post(ProductControler.addProduct)
  .put(ProductControler.updateProduct);
router.route("/new").get(ProductControler.getProductsNew);
router.route("/sale").get(ProductControler.getProductsSale);
router
  .route("/details/:idProduct")
  .get(ProductControler.getDetailsProduct)
  .post(ProductControler.addDetailsProduct)
  .put(ProductControler.updateProductDetails);
router.route("/details").put(ProductControler.updateProductDetails);
router
  .route("/image/:idProduct")
  .get(ProductControler.getImageProduct)
  .post(upload.single("image"), ProductControler.addImageProduct)
  router
  .route("/image/:idImageProduct").put(upload.single("image"), ProductControler.updateImage);
router
  .route("/productQuantity/:idProduct")
  .post(ProductControler.addProductQuantity)
  .put(ProductControler.updateImageQuantity);
router.route("/productQuantity").put(ProductControler.updateImageQuantity);
router.route("/get-all").get(ProductControler.getAll);
router.route("/:idCategory").get(ProductControler.getProductByIdCate);
router.route("/:idProduct/count").get(ProductControler.calculateTotalProduct);
router
  .route("/favourite/:idProduct")
  .post(ProductControler.addFavourite)
  .delete(ProductControler.deleteFavourite)
  .get(ProductControler.getAllFavourites);


module.exports = router;
