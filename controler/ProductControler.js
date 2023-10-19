const mongoose = require("mongoose");
const { Product, ProductDetail } = require("../model/product");
const Category = require("../model/category");
 
const getProductByIdCate = async (req, res, next) => {
  const idCategory = req.params.idCategory; // Assuming the category ID is in the route parameter
  try {
    const products = await Product.find({ idCata: idCategory })
      .populate({
        path: "productDetails",
        options: { limit: 1 }, // Limit to only one product detail
        populate: {
          path: "imageProducts.imageProduct", // Populate the image products for the product details
          options: { limit: 1 }, // Limit to only one product detail
        },
      })
      .exec();
    console.log("nguyen duy khang" + products);
    res.json(products);
  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const getDetailsProduct = async (req, res, next) => {
  const idProduct = req.params.idProduct; // Assuming the category ID is in the route parameter
  const product = await Product.findById({ _id: idProduct })
    .populate({
      path: "productDetails",
      populate: {
        path: "imageProducts.imageProduct", // Populate the image products for the product details
       }
    })

    .exec();
  res.json(product);
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate({
        path: "productDetails",
        options: { limit: 1 }, // Limit to only one product detail
        populate: {
          path: "imageProducts.imageProduct", // Populate the image products for the product details
          options: { limit: 1 }, // Limit to only one product detail
        },
      })
      .exec();

    res.json(products);
  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    categories.unshift({ _id: "", category: "All" });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductByIdCate,
  getDetailsProduct,
};
