const express = require("express");
const UserModel = require("../models/user.model");
const SubscriptionPackage = require("../models/subscriptionPackages.model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check.auth.admin");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/**
 * Register user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNo, password } = req.body;
    console.log("Here is data coming from body", firstName, lastName,);
    const isEmailExist = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (isEmailExist && isEmailExist.email) {
      res.json({
        success: 0,
        message: "User is already registered with this email",
        data: []
      })
    }
    const hashPassword = await bcrypt.hash(password, 10);
    // return res.json({ "Here is passs": hashPassword })
    const userModel = await UserModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
      phoneNo
    });
    if (!userModel) {
      return res.json({
        success: 0,
        message: "Error while registration",
        data: []
      })
    }
    return res.json({
      success: 1,
      message: "User is registered Successfully",
      data: userModel
    })
  } catch (error) {
    console.log("ERROR while user register", error);
    return res.json({
      success: 0,
      message: "Error while registering user",
      data: []
    })
  }
});

/**
 * User subscriptions
 * @create
 */
router.post('/subscription', async (req, res) => {
  let isSubScriAdded = await SubscriptionPackage.insertMany(req.body.data);
  return res.json({
    data: isSubScriAdded
  })
});

router.get("/subscription/packages", async (req, res) => {
  try {
    const subscriptionList = await SubscriptionPackage.find({}).lean();

    res.status(200).json({
      success: 1,
      message: "Subscription Packages are fetched successfully.",
      data: subscriptionList,
    });
  } catch (error) {
    console.log("Error while  subscription/packages", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: []
    })
  }
});

router.put('/buy/subscription', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    console.log("Here is data", subscription, userId)
    const isSubscriptionUpdated = await UserModel.findOneAndUpdate({ _id: userId }, { subscription: subscription }, { new: true })
    res.status(200).json({
      success: 1,
      message: "Subscription Packages is bought successfully.",
      data: isSubscriptionUpdated,
    });
  } catch (error) {
    console.log("Error while  buy/subscription", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: []
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    const isUserExist = await UserModel.findOne({ email: email.toLowerCase() }).populate({
      path: 'subscription',
      module: 'SubscriptionPackage',
      required: true,
    }).lean();
    console.log("Here is user", isUserExist)
    if (!isUserExist) {
      return res.json({
        success: 0,
        message: "Email or Password is not valid.",
        data: []
      })
    }
    const isPassCorrect = await bcrypt.compare(password, isUserExist.password)
    if (!isPassCorrect) {
      return res.json({
        success: 0,
        message: "Email or Password is not valid.",
        data: []
      })
    }
    const token = jwt.sign(
      {
        email: isUserExist.email,
        id: isUserExist._id,
      },
      process.env.secretKey,
      // {
      //   expiresIn: "1h",
      // }
    );
    return res.json({
      success: 1,
      message: "User is successfully logedIn.",
      data: {
        token: token,
        user: isUserExist
      }
    })
  } catch (error) {
    console.log("Error while login api", error);
    return res.json({
      success: 0,
      message: "Error while Login user",
      data: []
    })
  }
});

router.get("/refesh-token", function (req, res) {
  let token = req.headers.token;
  // console.log("Token in auth is ", token);
  try {
    const decode = jwt.verify(token, process.env.secretKey);
    // console.log("Decoded is ", decode);
    const Reftoken = jwt.sign(
      {
        email: decode.email,
        id: decode.id,
      },
      process.env.secretKey,
      // {
      // expiresIn: 420, // 7 min
      // expiresIn: "1h", // 7 min
      // }
    );
    res.status(200).json({
      success: 1,
      message: "Token refreshed successfully.",
      flag: true,
      refreshedToken: Reftoken,
    });
  } catch (error) {
    console.log("Error while refreshing user token", error);
    return res.json({
      success: 0,
      message: "Error while Refreshing user token",
      data: []
    })
  }
});

router.put('/update', checkAuth, async (req, res) => {
  try {
    console.log("update data", req.user);
    const isUpdated = await UserModel.findByIdAndUpdate({ _id: req.user.id }, req.body, { new: true });
    if (isUpdated) {
      return res.json({
        success: 1,
        message: "User info is Updated Successfully.",
        data: isUpdated
      })
    } else {
      return res.json({
        success: 0,
        message: "Error while updating User info",
        data: {},
      })
    }
  } catch (error) {
    return res.json({
      success: 0,
      message: "Error while updating User info",
      data: {},
      error: error
    })
    console.log("Error while updating user Info", error)
  }
});



module.exports = router;
