const express = require('express')
const router = express.Router()
const StatisticalControler =  require('../controler/StatisticalControler')

router.route("/").get(StatisticalControler.statistical) 
 

module.exports = router;