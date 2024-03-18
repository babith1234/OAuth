const upload = require('../middleware/upload')
const feedbackController = require("../controllers/feedbackController")

const express = require("express");

const router = express.Router();
router.post("/feedbacks",upload.single('image'),feedbackController.sendFeedback)
module.exports = router;