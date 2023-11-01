const mongoose = require("mongoose");
const { Product, ProductDetail } = require("../model/product");
const Category = require("../model/category");
const Favourite = require("../model/favourite");
const { DetailOrder } = require("../model/order");

const addFavourite = async (req, res, next) => {
  const productId = req.params.idProduct;
  const userId = req.user._id;
  const favourite = new Favourite({
    idProduct: productId,
    idUser: userId,
  });
  return favourite
    .save()
    .then((result) => {
      res.json({ message: `Add success` });
    })
    .catch((error) => {
      res.json({ error: `${error.message}` });
    });
};

const deleteFavourite = async (req, res, next) => {
  const productId = req.params.idProduct;
  const userId = req.user._id;
  return Favourite.deleteOne({ idProduct: productId, idUser: userId })
    .exec()
    .then((result) => {
      if (result.deletedCount === 1) {
        res.json({ message: `Delete success` });
      }
    })
    .catch((error) => {
      res.json({ error: `${error.message}` });
    });
};

const getAllFavourites = async (req, res, next) => {
  try {
    const favourite = await Favourite.findOne({
       idUser: req.user._id,
    });

    const product = await Product.find({
      _id: { $in: favourite.idProduct },
    }).populate({
      path: "productDetails",
      populate: {
        path: "imageProductQuantity",
        populate: {
          path: "imageProduct",
        },
      },
    });
 
    res.status(200).json(product);
  } catch (error) {
    console.log(error)
    res.status(400).json({error:error.message})
  }
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
  const idProduct =req.params.idProduct; // Assuming the product ID is in the route parameter
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
    detailOrder:  detailOrder || null,
  };
  res.status(200).json(productWithFavourite);
} catch (error) {
  res.status(400).json({error:error.message})
}
};


const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate({
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
  getAllFavourites,
  addFavourite,
  deleteFavourite,
};
