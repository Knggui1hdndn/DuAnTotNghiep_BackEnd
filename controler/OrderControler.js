const mongoose = require("mongoose");
const { Order, DetailOrder, payments, status } = require("../model/order");
const { Product } = require("../model/product");
const PayQR = require("../model/pay");
const Notification = require("../model/notification");
const updatePayment = async (req, res, next) => {
  const { money, timePayment, note } = req.body;
  try {
    const pay = await PayQR.findOne({
      note,
      totalAmount: money,
    })
      .where("expiration")
      .gt(timePayment);
    if (pay) {
      const order = await Order.findOneAndUpdate(
        { _id: pay.idOrder },
        { isPay: true },
        { new: true }
      );

      res.json({ success: true, order });
    } else {
      res.status(404).json({
        success: false,
        message: "Payment not found or invalid timePayment",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getOrderByStatus = async (req, res) => {
  try {
    const skip = req.query.skip != null ? req.query.skip : 0;
    const status = req.query.status;
    const order = await Order.find({ status: status, idUser: req.user._id })
      .skip(skip)
      .limit(5);
    console.log(order);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const purchase = async (req, res) => {
  try {
    const { address, name, phoneNumber } = req.body;
    const payment = req.body.payments;
    let description = "";
    let totalAmount = 0;
    const newIdOrder = new mongoose.Types.ObjectId();
    const orderDetails = await DetailOrder.find({
      idOrder: req.query.idOrder,
      isSelected: true,
    }).populate("idProduct", "name size");

    if (orderDetails + req.query.idOrder) {
      console.log(orderDetails);
      await DetailOrder.updateMany(
        {
          idOrder: req.query.idOrder,
          isSelected: true,
        },
        { $set: { idOrder: newIdOrder } }
      );

      orderDetails.forEach((item) => {
        totalAmount += item.intoMoney;
      });

      orderDetails.forEach((orderDetail) => {
        description += `${orderDetail.idProduct.name} (${orderDetail.size}) `;
      });
    }

    const newOrder = new Order({
      idUser: req.user._id,
      _id: newIdOrder,
      description: description,
      payments: payments[payment],
      address: address,
      name: name,
      phoneNumber: phoneNumber,
      totalAmount: totalAmount,
      status: status.WAIT_FOR_CONFIRMATION,
    });
    await newOrder.save();

    if (!newOrder) {
      throw new Error("Sever error");
    } else {
      return res.status(200).send(newIdOrder);
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};
const selectedAll = async (req, res) => {
  try {
    const order = await Order.findOne({
      isPay: false,
      payments: payments.VIRTUAL, // Assuming 'payments' is a variable or an object defined elsewhere
      idUser: req.user._id,
    });

    const result = await DetailOrder.updateMany(
      { idOrder: order._id },
      { isSelected: req.query.isAll }
    );
    console.log(result);

    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    res.status(500).json({ error: error.message });
  }
};

// danh sách đơn hàng
const getOrder = async (req, res, next) => {
  try {
    const orders = await Order.find();
    orders.unshift({ _id: "", orders: "All" });
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteOrderDetails = async (req, res) => {
  try {
    const _id = req.query.idDetailsOrder;
    const detailOrder = await DetailOrder.findByIdAndDelete({ _id: _id });
    if (!detailOrder) {
      return res.status(404).json({ error: "Detail order not found" });
    }

    res.status(201).json({ message: "Delete success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDetailOrders = async (req, res, next) => {
  try {
    const { _id, quantity, isSelected } = req.body;
    const detailOrder = await DetailOrder.findOneAndUpdate(
      { _id: _id },
      { $set: { isSelected: isSelected, quantity: quantity } },
      { new: true }
    )
      .populate({
        path: "idProduct",
        select: "name idOrder", // Chọn các trường cần lấy
      })
      .populate({
        path: "idImageProductQuantity",
        populate: {
          path: "imageProduct",
        },
      });
    res.status(201).json(detailOrder);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error.message });
  }
};

const getCountNotiAndOrderDetails = async (req, res) => {
  try {
    const orderDetails = await getCountDetailsOrder(req);
    const notification = await Notification.countDocuments({
      idUser: req.user._id,
      isSeen: false,
    });
    res.status(200).json({
      countOrderDetails: orderDetails,
      countNotification: notification,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getCountDetailsOrder = async (req) => {
  try {
    const order = await Order.findOne({
      idUser: req.user._id, // Thay đổi này dựa vào cách bạn truy cập idUser
      isPay: false,
      payments: payments.VIRTUAL,
    });

    if (order) {
      const orderDetailsCount = await DetailOrder.countDocuments({
        idOrder: order._id,
      });

      return orderDetailsCount;
    } else {
      return 0;
    }
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    throw new Error("Lỗi khi tìm kiếm đơn hàng.");
  }
};

const getDetailsOrders = async (req, res) => {
  var idOrder = req.query.idOrder;

  if (idOrder != null) {
    const order = await Order.findById(idOrder);
    var orderDetails = await DetailOrder.find({
      idOrder: idOrder,
    })
      .populate({
        path: "idProduct",
        select: "name -_id",
      })
      .select("-idProduct -idOrder -_id  ")
      .populate({
        path: "idImageProductQuantity",
        select: "-_id -idProductDetail",
        populate: {
          path: "imageProduct",
          select: "-_id -idProduct ",
        },
      })
      .lean();

    orderDetails = orderDetails.map((detail) => {
      const { idProduct, idImageProductQuantity, ...rest } = detail;  
      return {
        ...rest,
        name: idProduct.name,
        color: idImageProductQuantity.imageProduct.color,
        image: idImageProductQuantity.imageProduct.image,
        quantity: idImageProductQuantity.quantity,
      };
    });

    const rs = {
      ...order.toObject(),
      detailsOrder: orderDetails,
    };
    return res.send(rs);
  } else {
    getUnpaidInvoiceDetails(req, res);
  }
};
const getUnpaidInvoiceDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      idUser: req.user._id,
      isPay: false,
      payments: payments.VIRTUAL,
    });

    if (order) {
      await getDetailsOrderById(order._id);
      if (orderDetails) {
        res.status(200).json(orderDetails);
      } else {
        res
          .status(404)
          .json({ error: "No order details found for this order." });
      }
    } else {
      res.status(404).json({
        error: "No unpaid orders with the specified payment method found.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getDetailsOrderById = async (idOrder) => {
  const orderDetails = await DetailOrder.find({
    idOrder: idOrder,
  })
    .populate({
      path: "idProduct",
      select: "name",
    })
    .populate({
      path: "idImageProductQuantity",
      populate: {
        path: "imageProduct",
      },
    });
  return orderDetails;
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
    console.log(idImageProductQuantity);
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
  orderDetails.quantity = orderDetails.quantity + quantity;
  orderDetails.sale = sale;
  orderDetails.intoMoney = orderDetails.intoMoney + intoMoney;
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
  selectedAll,
  deleteOrderDetails,
  updateDetailOrders,
  getOrderByStatus,
  purchase,
  updatePayment,
  getOrder,
};
