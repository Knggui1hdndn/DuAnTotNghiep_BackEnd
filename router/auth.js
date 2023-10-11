const express = require('express')
const router = express.Router()
const AuthControler =  require('../controler/AuthControler')


 
//  const passport = require('passport')
// const passportConfig = require('../middelwares/passport.js')
 //passport.authenticate('local', { session: false }),passportConfig.customAuthenticate, 
 router.route('/google').post(AuthControler.authenticationGoogle) 
 router.route('/signUp').post( AuthControler.signUpLocal) 
 router.post('/loginUser', AuthControler.LoginUser);
 router.route('/sendOtp').post(AuthControler.sendOtp) 
 router.route('/verifyOtp').post(AuthControler.verificaionOtp) 
 router.route('/updatePassword').post(AuthControler.updatePassword) 

module.exports = router
