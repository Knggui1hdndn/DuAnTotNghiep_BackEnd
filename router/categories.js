const express = require("express");
const router = express.Router();
const CategoriesControler = require("../controler/CategoriesControler.js");

const passport = require("passport");
const passportConfig = require("../middelwares/passport.js");
router
.route("/categories")
.get(CategoriesControler.getCategories)
.post(CategoriesControler.addCategories)
.put( "/updateCategories/:idCategories",CategoriesControler.updateCategories)
.delete(CategoriesControler.deleteCategories);