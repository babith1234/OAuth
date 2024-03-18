const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  image: String,
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
