const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  name:String,
  email:String,
  otp:String,
  isVerified:Boolean
});

module.exports = mongoose.model("User", userSchema);
