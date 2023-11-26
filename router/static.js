const express = require('express')
const router = express.Router()
const StaticControler =  require('../controler/StaticControler')

router.route("/").get(StaticControler.getReveNue).post(StaticControler.postReveNue);


module.exports = router;