const Food = require("../models/foodModel");

const displayFood = async (req, res) => {
  try {
    const foods = await Food.find();

    if (!foods) {
      return res.status(401).json({
        success: false,
        message: "No food details found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Foods retrieved successfully",
      data: foods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const filterFoodByName = async (req, res) => {
  try {
    const { food_name } = req.body; 

    // Create a regular expression pattern to match the input name in a case-insensitive manner
    const regex = new RegExp(food_name, "i");

    // Query food based on the input name using the regular expression
    const filteredFood = await Food.find({ food_name: { $regex: regex } });

    if (!filteredFood) {
      return res.status(404).json({
        success: false,
        message: "No food item found with the specified name",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food item filtered successfully",
      data: filteredFood,
    });
  } catch (error) {
    console.error("Error filtering food:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { displayFood, filterFoodByName };
