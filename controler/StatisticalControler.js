const mongoose = require("mongoose");
const { Order, DetailOrder, payments, status } = require("../model/order");
const { Product, ImageQuantity } = require("../model/product");
const Evaluate = require("../model/evaluate.js");

const User = require("../model/user.js");
const countAllSp = async (periodProduct) => {
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
const totalProfit = async (period) => {
  period.status = status.DELIVERED;
  const order = await Order.find(period);
  const orderIdsArray = order.map((order) => order._id.toString());

  const detailOrders = await DetailOrder.find({
    idOrder: { $in: orderIdsArray },
  })
    .populate("idProduct")
    .exec();
  console.log(detailOrders);
  const totalProfit = detailOrders.reduce((acc, order) => {
    const quantitySold = order.quantity;
    const price = order.idProduct.price;
    const importPrice = order.idProduct.importPrice;
    const orderProfit = quantitySold * price - quantitySold * importPrice;
    acc += orderProfit;
    return acc;
  }, 0);
  return totalProfit;
};
const calculateYearlyProfits = async (req, res) => {
  const yearlyProfits = [];

  for (let month = 1; month <= 12; month++) {
    try {
      const monthlyProfit = await totalProfitByMonth(req.query.year, month);
      yearlyProfits.push({ month, profit: monthlyProfit });
    } catch (error) {
      console.log(error.message);
    }
  }

  res.send(yearlyProfits);
};

const totalProfitByMonth = async (year, month) => {
  const startOfMonth = moment(year + "-" + month + "-1")
    .startOf("day")
    .toDate()
    .getTime();
  var endOfMonth;
  if (parseInt(month) === 12) {
    endOfMonth = moment(year + "-" + parseInt(month) + "-30")
      .endOf("day")
      .toDate()
      .getTime();
  } else {
    endOfMonth = moment(year + "-" + (parseInt(month) + 1) + "-1")
      .endOf("day")
      .toDate()
      .getTime();
  }
  const period = {
    createAt: {
      $gte: startOfMonth,
      $lt: endOfMonth,
    },
    status: status.DELIVERED,
  };

  const orders = await Order.find(period);
  const orderIdsArray = orders.map((order) => order._id.toString());

  const detailOrders = await DetailOrder.find({
    idOrder: { $in: orderIdsArray },
  })
    .populate("idProduct")
    .exec();

  const totalProfit = detailOrders.reduce((acc, order) => {
    const quantitySold = order.quantity;
    const price = order.idProduct.price;
    const importPrice = order.idProduct.importPrice;

    const orderProfit = quantitySold * (price - importPrice);

    acc += orderProfit;
    return acc;
  }, 0);

  return totalProfit;
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
  const query = Product.find(period)
    .populate({
      path: "idCata",
      select: "category",
    })
    .select("-productDetails")
    .limit(5)
    .sort({ sold: -1 })
    .lean();

  const products = await query;
  console.log(products);

  const modifiedResult = products.map((product) => {
    const modifiedProduct = { ...product };
    try {
      modifiedProduct.idCata = product.idCata.category;
    } catch (error) {}
    return modifiedProduct;
  });
  return modifiedResult;
};
const top5SpXemNhieuNhat = async (period) => {
  const query = Product.find()
    .populate({
      path: "idCata",
      select: "category", // Chỉ lấy trường "name" từ bảng "category"
    })
    .select("-productDetails")
    .limit(5)
    .sort({ view: -1 })
    .lean();

  const products = await query;
  console.log(products);

  const modifiedResult = products.map((product) => {
    const modifiedProduct = { ...product };
    try {
      modifiedProduct.idCata = product.idCata.category;
    } catch (error) {}
    return modifiedProduct;
  });
  return modifiedResult;
};
const moment = require("moment");
const e = require("express");

const statistical = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log(startDate + "sá" + endDate);
    const period = {};
    if (startDate != null && endDate != null) {
      period.createAt = {
        $gte: moment(startDate).startOf("day").toDate().getTime(),
        $lte: moment(endDate).endOf("day").toDate().getTime(),
      };
    }

    if (req.query.isGetAll === "true") {
      period.createAt = {
        $lte: moment(Date.now()).endOf("day").toDate().getTime(),
      };
    } else if (req.query.isGetAll === "false") {
      return res.json([]);
    }
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
      top5View: await top5SpXemNhieuNhat(),
      top5Product: await getSoldProductsDetailsByDeliveredOrders(periodProduct1),
      revenue: revenue,
      profit: await totalProfit(periodProduct1),
    };
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};
const getSoldProductsDetailsByDeliveredOrders = async (periodProduct1) => {
  try {
    periodProduct1.status=status.DELIVERED
    const soldProductsDetails = await Order.aggregate([
      { $match: periodProduct1 },
      {
        $lookup: {
          from: 'detailorders',
          localField: '_id',
          foreignField: 'idOrder',
          as: 'details',
        },
      },
      { $unwind: '$details' },
      {
        $lookup: {
          from: 'products',
          localField: 'details.idProduct',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.idCata',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: {
            productId: '$details.idProduct',
          },
          name: { $first: '$product.name' },
          idCata: { $first: '$category.category' },
          price: { $first: '$details.price' },
          sold: { $sum: '$details.quantity' },
        },
      },
    ]);

    console.log(soldProductsDetails);
    return soldProductsDetails;
  } catch (error) {
    console.error('Error getting sold products details by delivered orders:', error);
    throw error;
  }
};


module.exports = {
  statistical,
  calculateYearlyProfits,
};
