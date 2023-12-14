const mongoose = require("mongoose");
const Category = require("../model/category");
const { Product } = require("../model/product");

const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status === undefined  ) {
      query.status = true;  
    }

    const categories = await Category.find(query);
    // categories.unshift({ _id: "", category: "All" });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const addCategories = async (req, res, next) => {
  const { category } = req.body;

  const items = new Category({ category: category });
  try {
    await items.save();
    res.status(201).send(items);
  } catch (error) {
    console.log(error);
  }
};
const visibilityCategory = async (req, res) => {
  try {
    const {status}=req.body
    const update = await Category.findByIdAndUpdate(
      req.query.idCategory ,
      { status: status },
      { new: true } // Return the modified document
    );

    if (!update) {
      return res.status(404).send("Category not found");
    }

    const update2 = await Product.updateMany(
      { idCata: update._id },
      { status: status }
    );

    res.status(200).send("Update successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

 

const updateCategories = async (req, res, next) => {
  const idCategories = req.params._id;

  const updateCategories = await Category.findByIdAndUpdate(
    idCategories,
    req.body.category
  );
  if (!updateCategories) {
    return res.send(404).json({ message: "categoryBook not found" });
  }
  res.status(200).json(updateCategories);
};
const deleteCategories = async (req, res, next) => {
  const idCategories = req.params._id;
  const deleteCategories = await Category.findByIdAndDelete(idCategories);
  if (!deleteCategories) {
    return res.send(404).json({ message: "categoryBook not found" });
  }
  res.json("delete success");
};
module.exports = {
  getCategories,
  addCategories,
  updateCategories,
  deleteCategories,visibilityCategory
};
