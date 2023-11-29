const idProduct = require("mongoose");
const { Product } = require("../model/product.js");
const Evaluate = require("../model/evaluate.js");
const { Order, DetailOrder, payments, status } = require("../model/order.js");
const { Feeling, TypeFeeling } = require("../model/feeling.js");
const { default: mongoose } = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

// /upload.array('images', 5)
const addEvaluates = async (req, res) => {
  try {
    const idProduct = req.params.idProduct;
    const uploadedFiles = req.files;
    const host = req.get("host");

    const imageLinks = uploadedFiles.map((file) => {
      return req.protocol + "://" + host + "/" + file.path;
    });

    const newEvaluate = await new Evaluate({
      idProduct: new mongoose.Types.ObjectId(idProduct),
      idUser: req.user._id,
      star: req.body.star,
      comment: req.body.comment,
      url: imageLinks,
      timeCreated: Date.now(),
    }).save();

    const count = await Evaluate.aggregate([
      {
        $match: {
          idProduct: newEvaluate.idProduct,
        },
      },
      {
        $group: {
          _id: null,
          averageStar: { $avg: "$star" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageStar = count.length > 0 ? count[0].averageStar : 0;
    const numberOfEvaluations = count.length > 0 ? count[0].count : 0;

    const newProduct = await Product.findOneAndUpdate(
      {
        _id: newEvaluate.idProduct,
      },
      {
        star: averageStar,
      }
    ); //tính trung bình star

    if (newProduct) {
      return res.status(200).json({ newEvaluate });
    }
    return res.status(400).json({ error: "sever error" });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ error: error.message });
  }
};

const getEvaluates = async (req, res) => {
  const idProduct = req.params.idProduct;
  const skip = req.query.skip != null ? req.query.skip : 0;
  try {
    const lissEvaluate = await Evaluate.find({
      idProduct:  idProduct ,
    })
      .populate("idUser")
      .populate("feelings")
      .limit(5)
      .skip(skip)
      ;
      console.log(lissEvaluate.length+"   "+skip)

    if (lissEvaluate) {
      return res.status(200).send(lissEvaluate);
    }
    return res.status(404).json({ error: "Object not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const deleteEvaluates = async (req, res) => {
  const idEvaluate = req.params.idEvaluate;
  try {
    const deleteEvaluates = await Evaluate.findOneAndDelete({
      _id: idEvaluate,
    })
      .populate("idUser")
      .populate("feelings");
    if (deleteEvaluates) {
      const imagePathsToDelete = deleteEvaluates.url;
      for (const imagePath of imagePathsToDelete) {
        try {
          await fs.unlink(new URL(imagePath).pathname);
          console.log(
            `Đã xóa ảnh tại đường dẫn: ${new URL(imagePath).pathname}`
          );
        } catch (err) {
          console.error(
            `Lỗi khi xóa ảnh tại đường dẫn ${new URL(imagePath).pathname}: ${
              err.message
            }`
          );
        }
      }
    }
    return res.status(404).json({ error: "Object not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateFeeling = async (req, res, typeFeeling) => {
  const idEvaluate = req.params.idEvaluate;
  try {
    const newFeeling = await Feeling.findOneAndUpdate(
      { _id: idEvaluate, idUser: req.user._id },
      {
        $set: {
          typeFeeling: typeFeeling,
          _id: new mongoose.Types.ObjectId(idEvaluate),
          idUser: req.user._id,
        },
      },
      { returnDocument: "before", upsert: true }
    );

    const findEvaluate = await Evaluate.findOne({
      _id: idEvaluate,
    })
      .populate("idUser")
      .populate("feelings");
    if (findEvaluate) {
      const indexOfFeeling = findEvaluate.feelings.findIndex(
        (feelingId) => feelingId._id.toString() === newFeeling._id.toString()
      );

      if (indexOfFeeling !== -1 && newFeeling.typeFeeling === typeFeeling) {
        findEvaluate.feelings.splice(indexOfFeeling, 1);
      } else if (indexOfFeeling === -1) {
        findEvaluate.feelings.push(newFeeling._id);
      }
      await findEvaluate.save();
      return res.status(200).send(findEvaluate);
    }
    return res.status(404).json({ error: "Object not found" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

const dislikeEvaluate = async (req, res) => {
  await updateFeeling(req, res, TypeFeeling.DISLIKE);
};

const preferEvaluate = async (req, res) => {
  await updateFeeling(req, res, TypeFeeling.LIKE);
};

const handelFeelingEvaluates = async (req, res) => {
  const typeFeeling = req.body.typeFeeling;

  if (TypeFeeling[typeFeeling] !== "LIKE") {
    await dislikeEvaluate(req, res);
  } else {
    await preferEvaluate(req, res);
  }
};

module.exports = {
  preferEvaluate,
  dislikeEvaluate,
  deleteEvaluates,
  getEvaluates,
  addEvaluates,
  handelFeelingEvaluates,
};
