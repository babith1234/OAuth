const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!order) {
      return res.status(401).json({
        success: false,
        message: "Couldn't create order",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

module.exports={createOrder}
