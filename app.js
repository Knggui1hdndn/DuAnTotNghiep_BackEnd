const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("./socket");
const dotenv = require("dotenv");
 
const cors = require("cors");
 
const app = express();
const server = http.createServer(app);
dotenv.config();
// Set up MongoDB connection
//exam :
const Categorys = require('./model/category'); // Import your Product model
const { Product, ProductDetail, ImageProduct,ImageQuantity }= require('./model/product'); // Import your ProductDetail model
 
const createSampleData = async () => {
  try {
    const category = new Category({ name: "Sample Category" });
    await category.save();

    const product = new Product({
      name: "Sample Product",
      price: 100,
      sold: 0,
      sale: 0,
      description: "A sample product description",
      idCata: category._id,
    });
    await product.save();

    const productDetail = new ProductDetail({
      idProduct: product._id,
      size: "L",
    });
    await productDetail.save();

   

    const imageQuantity = new ImageQuantity({
      idProductDetail: productDetail._id,
      imageProduct: imageProduct._id,
      quantity: 10,
    });
    await imageQuantity.save();
    const imageProduct = new ImageProduct({
      idImageQuantity: imageQuantity._id,
      color: "Red",
      image: "https://example.com/red-product-image.jpg",
    });
    await imageProduct.save();
    console.log("Sample data created successfully.");
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
};

// Gọi hàm tạo dữ liệu mẫu



 

const mongoURI = "mongodb+srv://khangnd:3002992121@cluster0.jb8tgpt.mongodb.net/DuAnTotNghiep?authMechanism=SCRAM-SHA-1&authSource=khangnd";//đổi url
 mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB") ;
  //  createSampleData();   
// Tạo bản ghi cho Product
 
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
const order = require("./router/order");
const Category = require("./model/category");

app.use("/products", productRoutes);
app.use("/order", order);
  
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
