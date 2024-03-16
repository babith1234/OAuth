const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const session = require("express-session");
// const nodemailer = require("nodemailer");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes= require("./routes/orderRoutes");
require("./auth");

dotenv.config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/food", foodRoutes);
app.use("/order",orderRoutes)
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

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});


