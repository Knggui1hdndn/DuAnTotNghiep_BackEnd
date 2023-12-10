const express = require("express");
const router = express.Router();
const OrderControler = require("../controler/OrderControler");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
router.route("/purchase").put(OrderControler.updatePayment);

router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/detail-order")
  .get(OrderControler.getDetailsOrders)
  .post(OrderControler.processDetailsOrder)
  .put(OrderControler.updateDetailOrders)
  .delete(OrderControler.deleteOrderDetails);
router.route("/detail-order/selectAll").put(OrderControler.selectedAll);
router.route("/ladingCode/:idOrder").put(OrderControler.addLadingCode);

router.route("/cancel/:idOrder").post(OrderControler.cancelOrder);

router
  .route("/count/orderDetails-notification")
  .get(OrderControler.getCountNotiAndOrderDetails);
router.route("/checkBuyNow").post(OrderControler.checkBuyNow);
router
  .route("/")
  .get(OrderControler.getOrderByStatus)
  .put(OrderControler.updateStatusOrder);
router.route("/search").get(OrderControler.getOrderAndSearch);
router.route("/purchase").post(OrderControler.purchase);
router.route("/listOrder").get(OrderControler.getOrder);
module.exports = router;
