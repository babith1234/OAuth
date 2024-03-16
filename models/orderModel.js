const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  order_id: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  address: String, 
  paymentMode: String,
});

module.exports = mongoose.model("Order", orderSchema);
