const express = require("express");
const router = express.Router();
const ProductControler = require("../controler/ProductControler");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
 router.use(passport.authenticate("jwt", { session: false }));
router.route("/categories").get(ProductControler.getCategories);
router.route("/").get(ProductControler.getProducts);
router.route("/new").get(ProductControler.getProductsNew);
router.route("/sale").get(ProductControler.getProductsSale);
router.route("/details/:idProduct").get(ProductControler.getDetailsProduct);
router.route("/:idCategory").get(ProductControler.getProductByIdCate);
router
  .route("/favourite/:idProduct")
  .post(ProductControler.addFavourite)
  .delete(ProductControler.deleteFavourite) 
  .get(ProductControler.getAllFavourites);

module.exports = router;
