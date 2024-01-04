const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("./socket");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Thay đổi đường dẫn nếu cần

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Expose admin to be used across your app
module.exports = admin;

const cors = require("cors");

const app = express();
const server = http.createServer(app);
dotenv.config();
// Set up MongoDB connection
//exam :
const Categorys = require("./model/category"); // Import your Product model
const {
  Product,
  ProductDetail,
  ImageProduct,
  ImageQuantity,
} = require("./model/product"); // Import your ProductDetail model

const corsOpts = {
  origin: "*",
  exposedHeaders: ["Authorization"],

  methods: ["GET", "POST", "PUT", "DELETE"],

  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Request-With",
  ],
};

const ImageProducts = require("./model/product").ImageProduct;
const Evaluate = require("./model/evaluate.js");
const newIP = "192.168.1.181";
const oldIP = "192.168.2.172";
const mongoURI =
  "mongodb+srv://khangnd:3002992121@cluster0.jb8tgpt.mongodb.net/DuAnTotNghiep?authMechanism=SCRAM-SHA-1&authSource=khangnd"; //đổi url
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
      console.log("Connected to MongoDB");
    ImageProducts.find({
      image: { $ne: null, $not: { $type: 4 } },
      image: { $regex: oldIP },
    })
      .then((documentsToUpdate) => {
        // Update each document in your application code
        const updatePromises = documentsToUpdate.map((doc) => {
          // Assuming 'image' is a string field
          doc.image = doc.image.replace(oldIP, newIP);
          return doc.save();
        });

        return Promise.all(updatePromises);
      })
      .then((updatedDocuments) => {
        console.log(`${updatedDocuments.length} records updated successfully.`);
      })
      .catch((err) => {
        console.error("Error updating records:", err);
      });
    Evaluate.find({
      url: { $ne: null, $not: { $type: 4 } },
      url: { $regex: oldIP },
    })
      .then((documentsToUpdate) => {
        // Update each document in your application code
        const updatePromises = documentsToUpdate.map((doc) => {
          // Assuming 'url' is an array of strings
          doc.url = doc.url.map((url) => url.replace(oldIP, newIP));
          return doc.save();
        });

        return Promise.all(updatePromises);
      })
      .then((updatedDocuments) => {
        console.log(`${updatedDocuments.length} records updated successfully.`);
      })
      .catch((err) => {
        console.error("Error updating records:", err);
      });
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
app.use("/uploads", express.static("uploads"));
app.use(express.json());

// Routes
const usersRoutes = require("./router/user");
const authRoutes = require("./router/auth");
const productRoutes = require("./router/product");
const order = require("./router/order");
  const chat = require("./router/chat.js");
const evaluate = require("./router/evaluate");
const categories = require("./router/categories");
const notification = require("./router/notification");
const static = require("./router/static");
const e = require("express");

app.use("/notification", notification);
app.use("/products", productRoutes);
app.use("/categories", categories);
app.use("/order", order);
app.use("/evaluate", evaluate);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/statistical", static);
  app.use("/chat", chat);

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
server.listen(port, "192.168.1.181", () =>
  console.log(`Server is listening on port ${port}`)
);
module.exports = { admin };
