const mongoose = require("mongoose");

// Định nghĩa schema cho class Evaluate
const favouriteSchema = new mongoose.Schema({
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Tham chiếu đến model Product
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model User
  },
});

 const Favourite = mongoose.model("Favourite", favouriteSchema);

module.exports = Favourite;
