const foodController = require("../controllers/foodController");

const express = require("express");

const router = express.Router();

// const {isLoggedIn} = require("../server");

router.get("/foods", foodController.displayFood);
router.get("/foods/filter",foodController.filterFoodByName)
// router.post("/orders",orderController.createOrder)
module.exports = router;
