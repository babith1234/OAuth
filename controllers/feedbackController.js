const feedbackModel = require("../models/feedbackModel");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

const sendFeedback = async (req, res) => {
  try {
    const { rating } = req.body;

    const imageFile = req.file;

    if (!imageFile) {
      return res.status(401).json({
        success: false,
        message: "No image provided",
      });
    }

    const imageResponse = await cloudinary.uploader.upload(imageFile.path, {
      folder: "feedback_images",
    });

    // Delete the file from the uploads folder
    fs.unlinkSync(imageFile.path);

    const imageUrl = imageResponse.secure_url;

    await feedbackModel.create({
      rating: rating,
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      image: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { sendFeedback };
