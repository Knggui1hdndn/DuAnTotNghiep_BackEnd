const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("./socket");
const app = express();
const server = http.createServer(app);

// Set up MongoDB connection
//exam :
const mongoURI = "mongodb+srv://khangnd:3002992121@cluster0.jb8tgpt.mongodb.net/DuAnTotNghiep?authMechanism=SCRAM-SHA-1&authSource=khangnd";//đổi url

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
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
const usersRoutes = require("../DuAnTotNghiep_BackEnd/router/user");
const authRoutes = require("../DuAnTotNghiep_BackEnd/router/auth");
const proRoutes = require("../DuAnTotNghiep_BackEnd/router/product");

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/pro",proRoutes);

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
