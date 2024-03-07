const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const session = require("express-session");
const nodemailer = require("nodemailer");

require("./auth");

dotenv.config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
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

// Generate OTP
function generateOTP(length) {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// Send OTP via Email
function sendOTPviaEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Your OTP for Verification",
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Email error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

// // Route handler to check the session
// app.get("/check-session", (req, res) => {
//   // Check if user ID exists in the session
//   if (req.session && req.session.passport && req.session.passport.user) {
//     const userId = req.session.passport.user;
//     res.send(`User ID ${userId} is stored in the session.`);
//   } else {
//     res.send("User ID is not found in the session.");
//   }
// });

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/protected",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/auth/protected", isLoggedIn, (req, res) => {
  let name = req.user.name;
  res.send(`Hello ${name}`);
});

app.get("/auth/google/failure", (req, res) => {
  res.send("Something went wrong");
});

// Handle OTP generation and sending
app.post("/auth/send-otp", async (req, res) => {
  try {
    const email = req.user.email;
    const userOTP = generateOTP(6); // Generate a 6-digit OTP
    // Save the OTP in the user's session or database
    req.session.userOTP = userOTP;
    // Send OTP via email
    sendOTPviaEmail(email, userOTP);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle OTP verification
app.post("/auth/verify-otp", async (req, res) => {
  try {
    const { userInputOTP } = req.body;
    const userStoredOTP = req.session.userOTP; // Retrieve OTP from session
    if (userInputOTP === userStoredOTP) {
      // OTP verification successful
      res.status(200).json({ message: "OTP verification successful" });
    } else {
      // OTP verification failed
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
