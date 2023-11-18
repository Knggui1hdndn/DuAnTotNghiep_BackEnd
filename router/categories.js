const express = require("express");
const router = express.Router();
const CategoriesControler = require("../controler/CategoriesControler.js");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
router.use(passport.authenticate("jwt", { session: false }));

router
  .route("/")
  .get(CategoriesControler.getCategories)
  .post(CategoriesControler.addCategories)
  ;
router.put(
  "/updateCategories/:_id",
  CategoriesControler.updateCategories
).delete(CategoriesControler.deleteCategories);

module.exports = router;
