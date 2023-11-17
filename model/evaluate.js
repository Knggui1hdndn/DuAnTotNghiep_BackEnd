const mongoose = require("mongoose");

// Định nghĩa schema cho class Evaluate
const evaluateSchema = new mongoose.Schema({
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Tham chiếu đến model Product
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
  feelings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feeling",
    },
  ],
  star: Number,
  comment: String,
  url: [String],
  timeCreated:{
    type:Number 
  }
});

// Tạo model Evaluate
const Evaluate = mongoose.model("Evaluate", evaluateSchema);

module.exports = Evaluate;
