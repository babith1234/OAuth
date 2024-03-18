// Import necessary modules and dependencies
const Order = require("../models/orderModel");
const axios = require("axios");
const User = require("../models/userModel"); // Import the User model

// Controller to create an order and trigger OTP sending
const createOrder = async (req, res) => {
  try {
    // Create the order in pending state
    const order = await Order.create({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending"
    });

    // Fetch the user document based on the provided user ObjectId
    const user = await User.findById(order.user); // Assuming 'user' is the field in Order document representing the ObjectId of the user in the User collection

    if (!user) {
      throw new Error('User not found');
    }

    // Trigger OTP sending using the retrieved email
    await axios.post("http://localhost:5000/send-otp", { email: user.email }); // Assuming you have an API endpoint to trigger OTP sending

    return res.status(201).json({
      success: true,
      message: "Order created successfully. OTP sent for confirmation."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const displayOrders = async(req,res)=>{
  try{
    const userId = req.params.id

    if(!userId){
      return res.status(401).json({
        success: false,
        message: "No userId provided"
      });
    }

    const orders = await Order.find({user:userId})
    console.log(orders)

    if(!orders){
      return res.status(401).json({
        success: false,
        message: "No orders found"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Orders retrieved successfully",
      orders:orders
    });

  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

}
// Export the controller
module.exports = { createOrder,displayOrders };
