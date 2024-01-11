const express = require('express')
const router = express.Router()
const StatisticalControler =  require('../controler/StatisticalControler')

router.route("/").get(StatisticalControler.statistical) 
router.route("/calculateYearlyProfits").get(StatisticalControler.calculateYearlyProfits) 
 

module.exports = router;