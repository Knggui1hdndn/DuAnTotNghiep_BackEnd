const express = require('express')
const router = express.Router()
const FavouriteControler =  require('../controler/FavouriteControler');

router
  .route("/favourite/:idProduct")
  .post(FavouriteControler.addFavourite)
  .delete(FavouriteControler.deleteFavourite) 
  .get(FavouriteControler.getAllFavourites);

module.exports = router;