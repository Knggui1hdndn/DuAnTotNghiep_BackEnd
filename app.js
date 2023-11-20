const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("./socket");
const dotenv = require("dotenv");
const path = require("path");
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Thay đổi đường dẫn nếu cần

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Expose admin to be used across your app
module.exports = admin;

const cors = require("cors");
 
const app = express();
const server = http.createServer(app);
dotenv.config();
// Set up MongoDB connection
//exam :
const Categorys = require('./model/category'); // Import your Product model
const { Product, ProductDetail, ImageProduct,ImageQuantity }= require('./model/product'); // Import your ProductDetail model
 
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

 

const mongoURI = "mongodb+srv://khangnd:3002992121@cluster0.jb8tgpt.mongodb.net/DuAnTotNghiep?authMechanism=SCRAM-SHA-1&authSource=khangnd";//đổi url
 mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB") ;
 
 
    })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const io = require("socket.io")(server);
  
 // Set up Socket.io
const users = {};
socket(io, users);

app.use(cors(corsOpts));

// Middleware
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));


 
// Routes
 const usersRoutes = require("./router/user");
const authRoutes = require("./router/auth");
const productRoutes = require("./router/product");
const order = require("./router/order");
const evaluate = require("./router/evaluate");
const categories = require("./router/categories");

app.use("/products", productRoutes);
app.use("/categories", categories);
app.use("/order", order);
app.use("/evaluate", evaluate);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
 
// 404 Not Found middleware
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
console.error(Date.now());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});
 
// Start server
const port = 8000;
server.listen(port,  () =>
  console.log(`Server is listening on port ${port}`)
);
module.exports={admin}