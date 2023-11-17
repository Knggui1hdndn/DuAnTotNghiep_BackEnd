const mongoose = require("mongoose");

const Favourite = require("../model/favourite");

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
    if (!favourite) return res.status(200).json([]);

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
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports ={
  addFavourite,
  getAllFavourites,
  deleteFavourite
}