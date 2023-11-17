const mongoose = require("mongoose");
const { Product, ProductDetail } = require("../model/product");
const Category = require("../model/category");
const Favourite = require("../model/favourite");
const { DetailOrder } = require("../model/order");
const getProducts = async (req, res, next, sortField = null) => {
  try {
    const query = Product.find({}).populate({
      path: "productDetails",
      options: { limit: 1 },
      populate: {
        options: { limit: 1 },
        path: "imageProductQuantity",
        populate: {
          path: "imageProduct",
          options: { limit: 1 },
        },
      },
    });

    if (sortField) {
      query.sort({ [sortField]: -1 });
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getProductsSale = (req, res, next) => {
  getProducts(req, res, next, "sale");
};

const getProductsNew = (req, res, next) => {
  getProducts(req, res, next, "timeCreateAt");
};


const getProductByIdCate = async (req, res, next) => {
  const idCategory = req.params.idCategory; // Assuming the category ID is in the route parameter
  try {
    const products = await Product.find({ idCata: idCategory }).populate({
      path: "productDetails",
      options: { limit: 1 },
      populate: {
        options: { limit: 1 },
        path: "imageProductQuantity",
        populate: {
          path: "imageProduct",
          options: { limit: 1 },
        },
      },
    });
    res.json(products);
  } catch (error) {
    // Handle any errors that occur during the query
    res.status(500).json({ error: "Server error" });
  }
};
const getDetailsProduct = async (req, res, next) => {
  try {
    const idProduct = req.params.idProduct; // Assuming the product ID is in the route parameter
    const product = await Product.findById({ _id: idProduct }).populate({
      path: "productDetails",
      populate: {
        path: "imageProductQuantity",
        populate: {
          path: "imageProduct",
        },
      },
    });

    const favourite = await Favourite.findOne({
      idProduct: idProduct,
      idUser: req.user._id,
    });

    const detailOrder = await DetailOrder.findOne({
      idProduct: idProduct,
      isPay: false,
    });

    const productWithFavourite = {
      ...product.toObject(),
      isFavourite: !!favourite,
      detailOrder: detailOrder || null,
    };
    res.status(200).json(productWithFavourite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  getProducts,
  getProductByIdCate,
  getDetailsProduct,
  getProductsSale,
  getProductsNew,
};
