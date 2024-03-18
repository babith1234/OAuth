const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const cron = require("node-cron");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const User = require("./models/userModel");
const Order = require("./models/orderModel");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const app = express();
require("./auth");

dotenv.config();
app.use(express.json());
app.use("/food", foodRoutes);
app.use("/order", orderRoutes);
app.use("/feedback", feedbackRoutes);
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

// function isLoggedIn(req, res, next) {
//   req.user ? next() : res.sendStatus(401);
// }

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/food/foods",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/auth/google/failure", (req, res) => {
  res.send("Something went wrong");
});

const cancelOrders = async () => {
  try {
    // Find orders that are pending and were created more than 20 minutes ago
    const twentyMinutesAgo = new Date(Date.now() - 1 * 60000); // 20 minutes in milliseconds
    const ordersToUpdate = await Order.find({
      status: "pending",
      createdAt: { $lte: twentyMinutesAgo },
    });

    // Update orders to "canceled" if OTP confirmation is not completed
    for (const order of ordersToUpdate) {
      if (!order.otpConfirmed) {
        order.status = "canceled";
        await order.save();
      }
    }
    console.log("Orders updated successfully");
  } catch (error) {
    console.error("Error updating orders:", error);
  }
};

// Schedule the cron job to run every 20 minutes
cron.schedule("*/01 * * * *", cancelOrders);

app.get("/verify-otp", (req, res) => {
  const { email } = req.query;

  // Render the OTP verification form with the email
  res.render("pages/verify-otp", { email });
});

//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email is required" });
//     }

//     // Generate OTP
//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       alphabets: false,
//       upperCase: false,
//       specialChars: false,
//     });

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     user.otp = otp;
//     await user.save();
//     // Send OTP via email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "babithpoojari@gmail.com",
//         pass: "msqg kicf ubxr zqqv",
//       },
//     });

//     const mailOptions = {
//       from: "babithpoojari@gmail.com",
//       to: email,
//       subject: "OTP for Confirmation",
//       text: `Your OTP for confirmation is: ${otp}`,
//     };

//     await transporter.sendMail(mailOptions);

//     // Redirect user to the OTP verification page with email as a query parameter
//     return res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);

//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to send OTP" });
//   }
// });

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.otp = otp;
    await user.save();

    // Construct the verification URL with the email as a query parameter
    const verificationUrl = `http://localhost:5000/verify-otp?email=${encodeURIComponent(
      email
    )}`;

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "babithpoojari@gmail.com",
        pass: "msqg kicf ubxr zqqv",
      },
    });

    const mailOptions = {
      from: "babithpoojari@gmail.com",
      to: email,
      subject: "OTP for Confirmation",
      text: `Your OTP for confirmation is: ${otp}. Click the following link to verify: ${verificationUrl}`,
    };

    await transporter.sendMail(mailOptions);

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    console.log(req.body);
    const { email, otp } = await req.body;
    console.log(otp);
    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // Fetch user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify OTP
    if (otp === user.otp) {
      // OTP is valid, perform necessary actions (e.g., mark user as verified)
      user.isVerified = true;
      await user.save();

      const orders = await Order.find({ user: user.id });
      if (!orders) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      // Update each order
      for (const order of orders) {
        order.status = "confirmed";
        await order.save();
      }

      return res
        .status(200)
        .json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify OTP" });
  }
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
