const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("./socket");
const dotenv = require("dotenv");

const app = express();
const server = http.createServer(app);
dotenv.config();
// Set up MongoDB connection
//exam :
const Categorys = require('./model/category'); // Import your Product model
const { Product, ProductDetail, ImageProduct }= require('./model/product'); // Import your ProductDetail model
 
const addProductWithDetails = async () => {
  const imageProduct = new ImageProduct({
    color: "Red",
    image: "https://cdn.dribbble.com/users/1147180/screenshots/5907734/iphone_6-7-8___1_2x.png",
  });
  
  // Tạo đối tượng ProductDetail
  const productDetail = new ProductDetail({
    size: "Large",
    imageProducts: [
      {
        imageProduct: imageProduct._id, // Gán đối tượng ImageProduct vào imageProduct
        quantity: 10,
      },
    ],
  });
  const ca = new Category({category:"Khang"})
  // Tạo đối tượng Product
  const product = new Product({
    name: "New Product",
    price: 200,
    sold: 0,
    sale: 0,
    description: "A new product description",
    productDetails: [productDetail._id], // Gán đối tượng ProductDetail vào productDetails
    idCata:  [ca._id], // Gán ID của danh mục
  });
  ca.save()
  imageProduct.save()
  productDetail.save()
  product.save()
};

 

const mongoURI = "mongodb+srv://khangnd:3002992121@cluster0.jb8tgpt.mongodb.net/DuAnTotNghiep?authMechanism=SCRAM-SHA-1&authSource=khangnd";//đổi url
 mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB") ;
    addProductWithDetails();
    })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const io = require("socket.io")(server);
  
 // Set up Socket.io
const users = {};
socket(io, users);

// Middleware
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(passport.initialize());

// Routes
const usersRoutes = require("./router/user");
const authRoutes = require("./router/auth");
const productRoutes = require("./router/product");
const Category = require("./model/category");

app.use("/products", productRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);

// 404 Not Found middleware
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});
 
// Start server
const port = 8000;
server.listen(port, "192.168.1.181", () =>
  console.log(`Server is listening on port ${port}`)
);
