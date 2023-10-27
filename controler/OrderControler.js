const mongoose = require("mongoose");
const { Order, DetailOrder, payments } = require("../model/order");
const { Product } = require("../model/product");
const Notification = require("../model/notification");
const getCountNotiAndOrderDetails = async (req, res) => {
  try {
    const orderDetails = await getDetailsOrders(req, false);
    const notification = await Notification.find({
      idUser: req.user._id,
      isSeen: false,
    });
    const noti = notification != null ? notification.length : 0;
    res.status(200).json({
      countOrderDetails: orderDetails.length,
      countNotification: noti,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDetailsOrders = async (req, res) => {
  try {
    const order = await Order.findOne({
      idUser: req.user._id,
      isPay: false,
      payments: payments.VIRTUAL,
    });

    if (order) {
      // Then, if an unpaid order exists, find its details using idOrder
      const orderDetails = await DetailOrder.find({
        idOrder: order._id,
      })
        .populate("idProduct", "name")
        .populate({
          path: "idImageProductQuantity",
          populate: {
            path: "imageProduct",
          },
        });

      
      if (orderDetails) {
        // Check if there are any order details, and respond with them if found
        console.log(orderDetails);
        res.status(200).json(orderDetails);
      } else {
        // Handle the case when there are no order details
        res
          .status(404)
          .json({ error: "No order details found for this order." });
      }
    } else {
      // Handle the case when no unpaid orders with the specified payment method are found
      res.status(404).json({
        error: "No unpaid orders with the specified payment method found.",
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const processDetailsOrder = async (req, res) => {
  const {
    size,
    idImageProductQuantity,
    idProduct,
    quantity,
    sale,
    intoMoney,
    price,
  } = req.body;
  try {
    const order = await checkOrderExist(req.user._id);

    if (order != null) {
      const orderDetails = await checkDetailsExist(
        order._id,
        idImageProductQuantity
      );

      if (orderDetails) {
        if (quantity === 0) {
          await removeCartItem(orderDetails);
        } else {
          await updateCartItem(orderDetails, quantity, sale, intoMoney, price);
        }
      } else {
        await addCartItem(
          order._id,
          idProduct,
          size,
          idImageProductQuantity,
          quantity,
          sale,
          intoMoney,
          price
        );
      }
    } else {
      await createOrder(
        req.user._id,
        idProduct,
        size,
        idImageProductQuantity,
        quantity,
        sale,
        intoMoney,
        price
      );
    }

    res.status(200).json({ message: "Product has been added to the cart." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

const checkOrderExist = async (idUser) => {
  try {
    const order = await Order.findOne({
      idUser: idUser,
      isPay: false,
      payments: payments.VIRTUAL,
    });
    return order;
  } catch (e) {
    return null;
  }
};

const checkDetailsExist = async (orderId, idImageProductQuantity) => {
  try {
    // Check if the order exists first
    const detailOrder = await DetailOrder.findOne({
      idImageProductQuantity: idImageProductQuantity,
      idOrder: orderId,
    });
    if (!detailOrder) {
      return res.status(404).json({ error: "Detail Order not found" });
    }

    return detailOrder;
  } catch (error) {
    return null;
  }
};

const createOrder = async (
  idUser,
  idProduct,
  size,
  idImageProductQuantity,
  quantity,
  sale,
  intoMoney,
  price
) => {
  const newOrder = new Order({
    idUser: idUser,
    isPay: false,
  });
  await addCartItem(
    newOrder._id,
    idProduct,
    size,
    idImageProductQuantity,
    quantity,
    sale,
    intoMoney,
    price
  );

  return newOrder.save();
};

const addCartItem = async (
  idOrder,
  idProduct,
  size,
  idImageProductQuantity,
  quantity,
  sale,
  intoMoney,
  price
) => {
  const newDetail = new DetailOrder({
    idOrder: idOrder,
    idProduct: idProduct,
    size: size,
    idImageProductQuantity: idImageProductQuantity,
    quantity: quantity,
    sale: sale,
    intoMoney: intoMoney,
    price: price,
    // Các trường khác của chi tiết đơn hàng
  });

  await newDetail.save();
};

const updateCartItem = async (
  orderDetails,
  quantity,
  sale,
  intoMoney,
  price
) => {
  orderDetails.quantity = quantity;
  orderDetails.sale = sale;
  orderDetails.intoMoney = intoMoney;
  orderDetails.price = price;
  await orderDetails.save();
};

const removeCartItem = async (orderDetails) => {
  await orderDetails.deleteOne();
};

module.exports = {
  processDetailsOrder,
  getCountNotiAndOrderDetails,
  getDetailsOrders,
};