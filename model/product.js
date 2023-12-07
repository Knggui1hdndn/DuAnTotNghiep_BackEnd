const mongoose = require("mongoose");
const { Order, DetailOrder } = require("./order");

// Định nghĩa schema cho Product
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  sold: Number,
  sale: Number,
  star: {
    type: Number,
    default: 0.0,
  },
  description: String,
  productDetails: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductDetail",
      },
    ],
    default: [],
  },
  idCata: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createAt: {
    type: Number,
    default: Date.now()
  }
});

// Định nghĩa schema cho ProductDetail
const productDetailSchema = new mongoose.Schema({
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  size: String,
  imageProductQuantity: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImageQuantity",
    },
  ],
});
const productQuantitySchema = new mongoose.Schema({
  idProductDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductDetail",
  },
  imageProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ImageProduct",
  },
  quantity: Number,
});

// Định nghĩa schema cho ImageProduct
const imageProductSchema = new mongoose.Schema({
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  color: String,
  image: String,
});
productSchema.pre("save", async function (next) {
  const product = this;

  if (product.isModified("price") || product.isModified("sale")) {
    // Find unpaid orders
    const unpaidOrders = await Order.find({
      isPay: false,
    });

    // Find unpaid DetailOrders associated with unpaid orders
    const unpaidDetailOrders = await DetailOrder.find({
      idOrder: { $in: unpaidOrders.map((order) => order._id) },
    });

    // Update the associated DetailOrder documents with the new price, sale, and intoMoney
    try {
      await DetailOrder.updateMany(
        {
          _id: {
            $in: unpaidDetailOrders.map((detailOrder) => detailOrder._id),
          },
        },
        {
          $set: {
            price: product.price,
            sale: product.sale,
            intoMoney: {
              $multiply: [
                "$quantity",
                {
                  $subtract: [1, { $divide: ["$sale", 100] }],
                },
                "$price", // Use '$price' to reference the product price
              ],
            },
          },
        }
      );
    } catch (error) {}
  }

  next();
});

// Tạo model Product
const ImageQuantity = mongoose.model("ImageQuantity", productQuantitySchema);
const ImageProduct = mongoose.model("ImageProduct", imageProductSchema);
const Product = mongoose.model("Product", productSchema);
const ProductDetail = mongoose.model("ProductDetail", productDetailSchema);

module.exports = { Product, ProductDetail, ImageProduct, ImageQuantity };
