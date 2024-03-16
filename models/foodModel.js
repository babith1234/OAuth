const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  food_name: {
    type: String,
    index: true,
  },

  description: String,
  price: Number,
  image: String,
  category: {
    type: String,
    enum: ["Vegetarian", "Non-Vegetarian", "Dessert"],
  },
});

module.exports = mongoose.model("Food", foodSchema);
