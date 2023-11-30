const mongoose = require("mongoose");
const {staticRevenue , staticUser}  = require('../model/static');
const moment = require('moment');

const getReveNue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    const statistics = await staticRevenue.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalSales: { $sum: '$price' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json(statistics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const postReveNue = async (req, res) => {
    try {
        const { price } = req.body;

        console.log("price : "+price);
    
        // Kiểm tra xem amount có tồn tại và là số không
        if (!price || isNaN(price)) {
          return res.status(400).json({ error: 'Invalid amount. Please provide a valid numeric amount.' });
        }
    
        const sale = new staticRevenue({ price });
        await sale.save();
    
        res.json({ success: true, sale });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

const getUser = async(req,res)=>{
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    const statistics = await staticUser.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalRegistrations: { $sum: 1 }
        }
      }
    ]);

    res.json(statistics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const postUser = async(req,res)=>{
    try {
        const { username, email } = req.body;
    
        if (!username || !email) {
          return res.status(400).json({ error: 'Username and email are required.' });
        }
    
        const user = new staticUser({ username, email });
        await user.save();
    
        res.json({ success: true, user });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

module.exports = { getReveNue, postReveNue,getUser,postUser };