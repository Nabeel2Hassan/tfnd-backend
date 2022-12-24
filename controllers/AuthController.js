const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
var fs = require("fs"); // file system
const crypto = require("crypto");
const sendMail = require("../shared/sendMailer");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    let name = Math.round(new Date().getTime() / 1000) + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    req.Filerror = "FileNotSupported";
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 3, // 3MB
  },
  fileFilter: fileFilter,
});

exports.signup = async function (req, res, next) {
  try {
    const { firstName, lastName, email, phoneNo, password } = req.body;
    console.log("Here is data coming from body", firstName, lastName);
    const isEmailExist = await UserModel.findOne({
      email: email.toLowerCase(),
    }).lean();
    if (isEmailExist && isEmailExist.email) {
      res.json({
        success: 0,
        message: "User is already registered with this email",
        data: [],
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    // return res.json({ "Here is passs": hashPassword })
    
    const customer = await stripe.customers.create({
      email: email.toLowerCase(),
    });
    const userModel = await UserModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
      phoneNo,
      stripe_customer_id:customer.id
    });
    if (!userModel) {
      return res.json({
        success: 0,
        message: "Error while registration",
        data: [],
      });
    }

    return res.json({
      success: 1,
      message: "User is registered Successfully",
      data: userModel,
    });
  } catch (error) {
    console.log("ERROR while user register", error);
    return res.json({
      success: 0,
      message: "Error while registering user",
      data: [],
    });
  }
};

exports.login = async function (req, res, next) {
  try {
    let { email, password } = req.body;
    const isUserExist = await UserModel.findOne({ email: email.toLowerCase() })
      .populate({
        path: "subscription",
        module: "SubscriptionPackage",
        required: true,
      })
      .lean();
    console.log("Here is user", isUserExist);
    if (!isUserExist) {
      return res.json({
        success: 0,
        message: "Email or Password is not valid.",
        data: [],
      });
    }
    const isPassCorrect = await bcrypt.compare(password, isUserExist.password);
    if (!isPassCorrect) {
      return res.json({
        success: 0,
        message: "Email or Password is not valid.",
        data: [],
      });
    }
    const token = jwt.sign(
      {
        email: isUserExist.email,
        id: isUserExist._id,
      },
      process.env.secretKey
      // {
      //   expiresIn: "1h",
      // }
    );
    return res.json({
      success: 1,
      message: "User is successfully logedIn.",
      data: {
        token: token,
        user: isUserExist,
      },
    });
  } catch (error) {
    console.log("Error while login api", error);
    return res.json({
      success: 0,
      message: "Error while Login user",
      data: [],
    });
  }
};

exports.profile = async function (req, res, next) {
  const id = req.user.id;
  console.log("Id : ", id);
  UserModel.findOne({ _id: id }, function (err, docs) {
    console.log("The data is:", docs);
    if (err) {
      console.log("Error id :", err);
      res.status(501).json({
        error: err,
      });
    }
    var data = docs;
    res.status(200).json(docs);
  });
};

exports.updateProfile = async function (req, res, next) {
  try {
    console.log("update data", req.user);
    const isUpdated = await UserModel.findByIdAndUpdate(
      { _id: req.user.id },
      req.body,
      { new: true }
    );
    if (isUpdated) {
      return res.json({
        success: 1,
        message: "User info is Updated Successfully.",
        data: isUpdated,
      });
    } else {
      return res.json({
        success: 0,
        message: "Error while updating User info",
        data: {},
      });
    }
  } catch (error) {
    return res.json({
      success: 0,
      message: "Error while updating User info",
      data: {},
      error: error,
    });
    console.log("Error while updating user Info", error);
  }
};

exports.updateProfileImage = async function (req, res, next) {
  try {
    console.log("update data", req.user);
    const isUpdated = await UserModel.findByIdAndUpdate(
      { _id: req.user.id },
      { image: req.file },
      { new: true }
    );
    if (isUpdated) {
      return res.json({
        success: 1,
        message: "User Profile Image is Updated Successfully.",
        data: isUpdated,
      });
    } else {
      return res.json({
        success: 0,
        message: "Error while updating User Profile Image",
        data: {},
      });
    }
  } catch (error) {
    return res.json({
      success: 0,
      message: "Error while updating Profile Image",
      data: {},
      error: error,
    });
    console.log("Error while updating user profile image", error);
  }
};

exports.sendToken = async function (req, res, next) {
  let user = await UserModel.findOne({ email: req.body.email });
  console.log(user);
  if (!user) res.status(400).send("User doesnot exists");

  if (user.resetToken) {
    let data = await UserModel.update(
      { email: user.email },
      { $unset: { resetToken: 1, resetExpire: 1 } }
    );
    console.log(data);
  }
  // creating a string and hashing using bcrypt
  let token = crypto.randomBytes(4).toString("hex");
  let hashToken = await bcrypt.hash(token, Number(12));
  console.log(token, hashToken);
  //creating expiry after 1 hour
  let expiry = new Date(Date.now() + 1 * 3600 * 1000);
  //updating the users table with resetToken and resetExpire
  let data = await UserModel.findOneAndUpdate(
    { email: user.email },
    { $set: { resetToken: hashToken, resetExpire: expiry } },
    { ReturnDocument: "after" }
  );
  console.log(data);

  await sendMail(user.email, "Password Reset", token);

  res.status(200).send({ message : "Token sent to email" , success : 1 , data : {} });
};

exports.verifyToken = async function (req, res, next) {
  let user = await UserModel.findOne({ _id: ObjectId(req.params.userId) });
  if (!user) return res.status(400).send("Invalid token or expired");

  let token = req.params.token;

  const isValid = await bcrypt.compare(token, user.resetToken);
  const expire = user.resetExpire > Date.now();

  if (isValid && expire) {
    res.status(200).send({ success: true });
  } else res.status(400).send({ Error: "invalid token or expired" });
};

exports.verifyAndUpdatePassword = async function (req, res, next) {
  let user = await UserModel.findOne({ email: req.body.email });
  if (!user.resetToken) return res.status(400).send({ success : 0 , message : "Invalid token or expired" , error : "Error occured invalid token or expired" , data : null });

  let token = req.params.token;

  const isValid = await bcrypt.compare(token, user.resetToken);
  const expire = user.resetExpire > Date.now();
  console.log(Date.now(), user.resetExpire.getTime(), expire);
  if (isValid && expire) {
    const password = req.body.password;
    const hashPassword = await bcrypt.hash(password, Number(12));
    console.log(hashPassword);
    let data = await UserModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: { password: hashPassword },
        $unset: { resetToken: 1, resetExpire: 1 },
      },
      { ReturnDocument: "after" }
    );
    console.log(data);
    res.status(200).send({ data : {}  , success : 1, message : "Password updated successfully" , error : null });
  } else res.status(400).send({ data : null , success : 0 , message : "Invalid token or expired", error : "Invalid token posted" });
};
