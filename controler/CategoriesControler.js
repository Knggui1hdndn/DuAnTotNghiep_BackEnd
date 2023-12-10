const mongoose = require("mongoose");
const Category = require("../model/category");

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    categories.unshift({ _id: "", category: "All" });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const addCategories = async(req, res, next) =>{
    const {category} =req.body;

    const items = new Category({category:category});
    try{
       await items.save();
      res.status(201).send(items);
    }catch(error){
      console.log(error);
    }
  };

const updateCategories = async(req, res, next) =>{
  const idCategories = req.params._id;
  
  const updateCategories = await Category.findByIdAndUpdate(
    idCategories,
    req.body
  )
  if(!updateCategories){
    return res.send(404).json({ message: "categoryMenStyle not found" });
  }
  res.status(200).json(updateCategories);

}
const deleteCategories = async(req, res, next) =>{
  const idCategories = req.params._id;
  const deleteCategories = await Category.findByIdAndDelete(
    idCategories
  );
  if(!deleteCategories){
    return res.send(404).json({ message: "categoryMenStyle not found" });
  }
  res.json("delete success");
}
module.exports={
  getCategories,
  addCategories,
  updateCategories,
  deleteCategories,
}