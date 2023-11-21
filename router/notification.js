const express = require("express");
const router = express.Router();
const NotificationControler = require("../controler/Notification.js");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
router.use(passport.authenticate("jwt", { session: false }));

router
  .route("/")
  .get(NotificationControler.getNotification)
  .put(NotificationControler.updateNotification);
 

module.exports = router;
