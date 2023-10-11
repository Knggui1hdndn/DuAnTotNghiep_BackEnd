const mongoose = require('mongoose');
const Product = require('../model/product');

const getProduct = async (req,res,next)=>{
try {
    const product = await Product.find({});
    res.json(product);
} catch (err) {
    console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
}
};
const addProduct = async(req,res,next)=>{
    const newPro = new Product({
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        sold: req.body.sold,
        sale: req.body.sale,
        describe:req.body.describe,
        idCata: req.body.idCata,
    });
    newPro
    .save()
    .then(()=>{
        res.status(200).json({ message: "post thành công" });
    })
    .catch((error) => {
      res.status(500).json({ error: "post không thành công" });
    });
};

const findIDCat = async(req,res,next)=>{
    const id = req.body.idCata;
    const{_id, name,
        image,
        price,
        sold,
        sale,
        describe} = req.body;
        try {
            const proCat = await Product.findById({id});
            res.json(proCat);
        } catch (err) {
            console.error("Error fetching users:", err);
                res.status(500).send("Internal Server Error");
        }

}
module.exports = {
    getProduct,
    addProduct,
    findIDCat,
  };