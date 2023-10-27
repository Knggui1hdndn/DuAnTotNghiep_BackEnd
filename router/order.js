const express = require("express");
const router = express.Router();
const OrderControler = require("../controler/OrderControler");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
 //  router.use(passport.authenticate("jwt", { session: false }));
router.route("/detail-order").get(OrderControler.getDetailsOrders).post(OrderControler.processDetailsOrder);
 router
  .route("/count/orderDetails-notification")
  .get(OrderControler.getCountNotiAndOrderDetails);

module.exports = router;
