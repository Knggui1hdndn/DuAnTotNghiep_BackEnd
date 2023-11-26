const mongoose = require("mongoose");
const staticScheme = new mongoose.Schema({
  price: Number,
  createdAt: { type: Date, default: Date.now },

});
 const Static = mongoose.model("Static", staticScheme);

module.exports = Static;
