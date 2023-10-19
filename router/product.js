const express = require('express')
const router = express.Router()
const ProductControler =  require('../controler/ProductControler')
 
//  const passport = require('passport')
// const passportConfig = require('../middelwares/passport.js')
 //passport.authenticate('local', { session: false }),passportConfig.customAuthenticate, 
 router.route('/categories').get(ProductControler.getCategories) 
 router.route('/').get(ProductControler.getProducts) 
 router.route('/details/:idProduct').get(ProductControler.getDetailsProduct) 
 router.route('/:idCategory').get( ProductControler.getProductByIdCate) 
  
module.exports = router
