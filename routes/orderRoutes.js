const orderController=require('../controllers/orderController')
const express = require("express");

const router = express.Router();
router.post("/orders",orderController.createOrder)
module.exports = router;