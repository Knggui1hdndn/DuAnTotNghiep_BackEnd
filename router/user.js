const express = require("express");
const router = express.Router();
const UserControler = require("../controler/UserControler");

 const passport = require('passport')
//const passportConfig = require('../middelwares/passport.js')
router.use(passport.authenticate('jwt', { session: false }))
router.route('/generate/QR').post(UserControler.generateQrPay)
router.route('/search').post(UserControler.searchProduct)
module.exports = router;
