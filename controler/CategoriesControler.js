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
 
    const categories =req.body;
    if(categories.categorySchema){
      return res
      .status(404)
      .json({message: "Các trường không được để trống"});
    }
    const check = await Category.findOne({
      categorySchema: categories.categorySchema,
    });
    if(check){
      res.status(404).json({ message: "categorySchema đã tồn tại" })
    }
    const items = new Category(categories);
    try{
      console.log(items);
      await items.save();
      res.send(items);
  
    }catch(error){
      console.log(error);
    }
  };

const updateCategories = async(req, res, next) =>{
  const categories = req.params._id;
  if (categories.categorySchema == ""){
    return res
    .status(404)
    .json({ message: "Các trường không được để trống" });

  }
  const updateCategories = await Category.findByIdAndUpdate(
    _id,
    req.body
  )
  if(!updateCategories){
    return res.send(404).json({ message: "categoryBook not found" });
  }
  res.status(200).json(updateCategories);

}
const deleteCategories = async(req, res, next) =>{
  const idCategories = req.params._id;
  const deleteCategories = await Category.findByIdAndDelete(
    idCategories
  );
  if(!deleteCategories){
    return res.send(404).json({ message: "categoryBook not found" });
  }
  res.json("delete success");
}
module.exports={
  getCategories,
  addCategories,
  updateCategories,
  deleteCategories,
}