const mongoose = require('mongoose');
const Cat = require('../model/category');

const getAllCat = async(req,res,next)=>{
    try {
        const cat = await Cat.find({});
        res.json(cat);
    } catch (err) {
        console.error("Error fetching users:", err);
            res.status(500).send("Internal Server Error");
    }
}

module.exports={
    getAllCat
}