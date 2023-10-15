const express = require('express')
const router = express.Router()
const ProControler =  require('../controler/ProductControler');

router.route("/").get(ProControler.getProduct);
router.route("/add").post(ProControler.addProduct);
router.route("/:id").get(ProControler.findIDCat);

module.exports = router