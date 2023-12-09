const mongoose = require("mongoose");
const { Order, DetailOrder, payments, status } = require("../model/order");
const { Product, ImageQuantity } = require("../model/product");
const Evaluate = require("../model/evaluate.js");

const User = require("../model/user.js");
const countAllSp = async (periodProduct) => {
  console.log(periodProduct)
  const count = await Product.countDocuments(periodProduct);
  return count;
};
const countProductNew = async (period) => {
  const count = await Product.countDocuments(period);
  return count;
};
const countEvaluateNew = async (period) => {
  const count = await Evaluate.countDocuments(period);
  return count;
};
const countProductSold = async (period) => {
  period.status = status.DELIVERED;
  const orders = await Order.find(period).select("_id");

  const orderIds = orders.map((order) => order._id);

  const countProductSold = await DetailOrder.aggregate([
    {
      $match: {
        idOrder: {
          $in: orderIds,
        },
      },
    },
    {
      $group: {
        _id: null,
        countProductSold: { $sum: "$quantity" },
        revenue: { $sum: "$intoMoney" },
      },
    },
  ]);
  return countProductSold;
};

const countOrderNew = async (period) => {
  period.status = { $ne: status.HOLLOW };
  const count = await Order.countDocuments(period);

  return count;
};
const countUserNew = async (period) => {
  const count = await User.countDocuments(period);
  return count;
};

const getCountByStatus = async (period, status) => {
  period.status = status;
  const count = await Order.countDocuments(period);
  return count;
};

const countWaitForConfirmation = async (period) => {
  return getCountByStatus(period, status.WAIT_FOR_CONFIRMATION);
};

const countDelivering = async (period) => {
  return getCountByStatus(period, status.DELIVERING);
};

const countConfirmed = async (period) => {
  return getCountByStatus(period, status.CONFIRMED);
};

const countDelivered = async (period) => {
  return getCountByStatus(period, status.DELIVERED);
};

const countCancel = async (period) => {
  return getCountByStatus(period, status.CANCEL);
};

const countReturns = async (period) => {
  return getCountByStatus(period, status.RETURNS);
};

const top5Product = async (period) => {
  const products = await Product.find(period)
    .select("-idCata -productDetails")
    .limit(5)
    .sort({ sold: -1 });
  return products;
};
const moment = require("moment");

const statistical = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const period = {};
    if (startDate != null && endDate != null) {
      period.createAt = {
        $gte: moment(startDate).startOf("day"),
        $lte: moment(endDate).endOf("day"),
      };
    }

    if (req.query.isGetAll) {
      period.createAt = {
        $lte: moment(Date.now()).endOf("day"),
      };
    }
    console.log(period.createAt)
    const periodProduct = { ...period };
    const periodProduct3 = { ...period };
    const periodOrder = { ...period };
    const top5 = { ...period };
    const periodProduct1 = { ...period };
    const d = await countProductSold(periodProduct);
    var revenue = 0;
    var productSold = 0;
    if (d.length > 0) {
      productSold = d[0].countProductSold;
      revenue = d[0].revenue;
    }
    const result = {
      countAllSp: await countAllSp(period),
      countProductNew: await countProductNew(periodProduct3),
      countProductSold: productSold,
      countOrderNew: await countOrderNew(period),
      countUserNew: await countUserNew(periodOrder),
      countWaitForConfirmation: await countWaitForConfirmation(period),
      countDelivering: await countDelivering(period),
      countConfirmed: await countConfirmed(period),
      countDelivered: await countDelivered(period),
      countCancel: await countCancel(period),
      countReturns: await countReturns(period),
      countEvaluateNew: await countEvaluateNew(periodProduct1),
      revenue: revenue,
      top5Product: await top5Product(top5),
    };
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

module.exports = {
  statistical,
};
