const mongoose = require("mongoose");
const staticRevenueScheme = new mongoose.Schema({
  price: Number,
  date: { type: Date, default: Date.now },

});


const staticUserSchema = new mongoose.Schema({
  username: String,
  email: String,
  date: { type: Date, default: Date.now },
});

const staticRevenue = mongoose.model("staticRevenue", staticRevenueScheme);
const staticUser = mongoose.model('staticUser', staticUserSchema);
module.exports = {staticUser,staticRevenue};