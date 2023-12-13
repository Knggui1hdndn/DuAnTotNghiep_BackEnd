const {
  Product,
  ProductDetail,
  ImageProduct,
  ImageQuantity,
} = require("../model/product");
const Category = require("../model/category");
const Favourite = require("../model/favourite");
const { DetailOrder } = require("../model/order");

const addProduct = async (req, res) => {
  const { name, price, sold, sale, description, idCata } = req.body;
  const newProduct = await new Product({
    name,
    price,
    sold,
    sale,
    description,
    star: 0.0,
    idCata,
  }).save();
  res.status(201).send(newProduct);
};

const visibilityProduct = async (req, res) => {
  try {
    const {status}=req.body
    const update = await Product.findByIdAndUpdate(
      req.query.idProduct,
      { status: status },
      { new: true } // Return the modified document
    );
     if (!update) {
      return res.status(404).send("Product not found");
    }

    res.status(200).send("Update successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const updateProduct = async (req, res) => {
  const { name, price, sale, description, idCata, id } = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id: id,
    },
    { name, price, sale, description, idCata },
    { new: true }
  );
  if (updatedProduct) {
    res.status(200).json({ message: "Update successful" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
const updateProductDetails = async (req, res) => {
  const { size, idProductDetail } = req.body;
  const updateProductDetails = await ProductDetail.findByIdAndUpdate(
    {
      _id: idProductDetail,
    },
    { size },
    { new: true }
  );
  if (updateProductDetails) {
    res.status(200).json({ message: "Update successful" });
  } else {
    res.status(404).json({ message: "ProductDetails not found" });
  }
};
const updateImageQuantity = async (req, res) => {
  const { idImageQuantity, image, quantity } = req.body;
  const updateImageQuantity = await ImageQuantity.findByIdAndUpdate(
    {
      _id: idImageQuantity,
    },
    { image, quantity },
    { new: true }
  );
  if (updateImageQuantity) {
    res.status(200).json({ message: "Update successful" });
  } else {
    res.status(404).json({ message: "ImageQuantity not found" });
  }
};
const mongoose = require("mongoose");

const addDetailsProduct = async (req, res) => {
  const idProduct = req.params.idProduct;
  const { size } = req.body;

  // Tạo một ObjectId từ chuỗi idProduct
  const idProductObjectId = new mongoose.Types.ObjectId(idProduct);

  try {
    // Tạo một ProductDetail mới với idProductObjectId và size
    const newProductDetail = await new ProductDetail({
      idProduct: idProductObjectId,
      size,
    }).save();

    // Cập nhật mảng productDetails của Product
    await Product.findByIdAndUpdate(
      { _id: idProduct },
      { $push: { productDetails: newProductDetail._id } }
    );

    res.status(201).send(newProductDetail);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = addDetailsProduct;

const addImageProduct = async (req, res) => {
  const idProduct = req.params.idProduct;
  const { color } = req.body;
  const host = req.get("host");
  const filePath = req.protocol + "://" + host + "/" + req.file.path;
  const imageProduct = await new ImageProduct({
    idProduct,
    color,
    image: filePath,
  }).save();
  res.status(201).send(imageProduct);
};

const getImageProduct = async (req, res) => {
  const idProduct = req.params.idProduct;
  const images = await ImageProduct.find({ idProduct });
  res.status(200).send(images);
};

const addProductQuantity = async (req, res) => {
  const { idProductDetail, imageProduct, quantity } = req.body;
  try {
    const newProductQuantity = await new ImageQuantity({
      idProductDetail,
      imageProduct,
      quantity,
    }).save();
    const updatedProductDetail = await ProductDetail.findByIdAndUpdate(
      idProductDetail,
      {
        $push: { imageProductQuantity: newProductQuantity._id },
      },
      { new: true }
    );
    res.status(200).send(updatedProductDetail);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProducts = async (req, res, next, sortField = null) => {
  try {
    const limit = 5;
    var{status} =req.query
    if(status==null) status=true
    const query = Product.find()
      .populate({
        path: "idCata",
        select: "category", // Chỉ lấy trường "name" từ bảng "category"
      })
      .populate({
        path: "productDetails",
        populate: {
          path: "imageProductQuantity",
          populate: {
            path: "imageProduct",
          },
        },
      })

      .skip(req.query.skip)
      .limit(5)
      .lean();
    if (sortField) {
      query.sort({ [sortField]: -1 });
    }

    const products = await query;
    console.log(products);

    const modifiedResult = products.map((product) => {
      const modifiedProduct = { ...product };
      try {
        modifiedProduct.idCata = product.idCata.category;
      } catch (error) {}
      return modifiedProduct;
    });
    res.json(modifiedResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getProductsSale = (req, res, next) => {
  getProducts(req, res, next, "sale");
};

const getProductsNew = (req, res, next) => {
  getProducts(req, res, next, "createAt");
};

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

    const product = await Product.find(favourite.idProduct).populate({
      path: "productDetails",
      populate: {
        path: "imageProductQuantity",
        populate: {
          path: "imageProduct",
        },
      },
    });
    console.log(product);

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const getProductByIdCate = async (req, res, next) => {
  // Set skip to 0 if req.query.skip is not provided
  const skip = req.query.skip == null ? 0 : parseInt(req.query.skip);

  const idCategory = req.params.idCategory; // Assuming the category ID is in the route parameter
  try {
    const products = await Product.find({ idCata: idCategory, status: true })
      .populate({
        path: "idCata",
        select: "category",
      })
      .populate({
        path: "productDetails",
        populate: {
          path: "imageProductQuantity",
          populate: {
            path: "imageProduct",
          },
        },
      })
      .skip(skip)
      .limit(5)
      .lean();

    console.log(products.length);

    res.json(products);
  } catch (error) {
    // Handle any errors that occur during the query
    res.status(500).json({ error: "Server error" });
  }
};

const calculateTotalProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.idProduct });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalQuantity = await ImageQuantity.aggregate([
      {
        $match: {
          idProductDetail: {
            $in: product.productDetails,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);
    console.log(totalQuantity + product.productDetails);
    if (totalQuantity.length > 0) {
      res.json(totalQuantity[0].totalQuantity);
    } else {
      res.json(0);
    }
  } catch (error) {
    console.error(
      "Error calculating total product quantity by idProduct:",
      error
    );
    res.status(500).json({ error: "Server error" });
  }
};

const getDetailsProduct = async (req, res, next) => {
  try {
    const idProduct = req.params.idProduct; // Assuming the product ID is in the route parameter
    var product = await Product.findById({ _id: idProduct })
      .populate({
        path: "idCata",
        select: "category", // Chỉ lấy trường "name" từ bảng "category"
      })
      .populate({
        path: "productDetails",
        populate: {
          path: "imageProductQuantity",
          populate: {
            path: "imageProduct",
          },
        },
      })
      .lean();
    const modifiedProduct = { ...product };

    modifiedProduct.idCata = product.idCata.category;

    const favourite = await Favourite.findOne({
      idProduct: idProduct,
      idUser: req.user._id,
    });

    const detailOrder = await DetailOrder.findOne({
      idProduct: idProduct,
      isPay: false,
    });

    const productWithFavourite = {
      ...modifiedProduct,
      isFavourite: !!favourite,
      detailOrder: detailOrder || null,
    };

    res.status(200).json(productWithFavourite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategories = async (req, res, next) => {
  try {
    var { status } = req.query;
    if (status == null) status = true;
    const categories = await Category.find({ status: status });
    categories.unshift({ _id: "", category: "All" });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const getAll = async (req, res) => {
  var { status } = req.query;
  if (status == null) status = true;
  const data = await Product.find({status:status});
  if (data) {
    return res.json({
      total: data,
    });
  }
};
const searchProduct = async (req, res, next) => {
  try {
    const {   name } = req.query;
    var { status } = req.query;
    if (status == null) status = true;
    const data = await Product.find({
      name: { $regex: name, $options: "i", status: status },
    })
      .populate({
        path: "idCata",
        select: "category",
      })
      .select("-productDetails")
      .lean();

    const products = await data;
    console.log(products);

    const modifiedResult = products.map((product) => {
      const modifiedProduct = { ...product };
      try {
        modifiedProduct.idCata = product.idCata.category;
      } catch (error) {}
      return modifiedProduct;
    });
    res.json(modifiedResult);
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
module.exports = {
  searchProduct,
  getCategories,
  getProducts,
  getProductByIdCate,
  getDetailsProduct,
  getAllFavourites,
  addFavourite,
  deleteFavourite,
  getProductsSale,
  getProductsNew,
  addProduct,
  addDetailsProduct,
  addImageProduct,
  getImageProduct,
  addProductQuantity,
  updateImageQuantity,
  updateProductDetails,
  updateProduct,
  calculateTotalProduct,
  getAll,
  visibilityProduct,
};
