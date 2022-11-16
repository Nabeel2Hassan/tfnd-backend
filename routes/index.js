const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const AdminModel = require("../models/admin.model");
const CategoryModel = require("../models/category.model");
const BusinessModel = require("../models/business.model");
const EventModel = require("../models/event.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
var fs = require("fs"); // file system

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

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Z S KEEN, TFND BK" });
});

router.get("/zain", function (req, res) {
  res.status(200).json({
    developer: "Z S KEEN",
    email: "zainkeen@gmail.com",
  });
});

// Super Admin

// to be Removed
// router.post("/adminSignup", (req, res) => {
//   bcrypt.hash(req.body.password, 10, function (err, hash) {
//     if (err) {
//       console.log("Error in Generating Password Hash", err);
//       res.send({ message: "Hash Failed", error: err });
//     } else {
//       const newAdmin = AdminModel({
//         adminName: req.body.adminName,
//         email: req.body.email,
//         phNo: req.body.phNo,
//         password: hash,
//       });
//       newAdmin
//         .save()
//         .then((result) => {
//           // console.log("Admin created is ", result);
//           res.send({
//             message: "AdminAdded",
//           });
//         })
//         .catch((err) => {
//           console.log("error in Catch Admin Added");
//           res.send({ error: err });
//         });
//     }
//   });
// });

router.post("/adminLogin", (req, res) => {
  try {
    AdminModel.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "AuthFaild",
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "AuthFaild",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                adminId: user[0]._id,
              },
              process.env.secretKey,
              // {
                // expiresIn: "1h",
                // expiresIn: 60, // in seconds 2mins
                // expiresIn: 420, // in seconds 7mins
              // }
            );
            return res.status(200).json({
              message: "AuthSucess",
              token: token,
            });
          }
          res.status(401).json({
            message: "AuthFaild",
          });
        });
      })
      .catch((err) => {
        console.log("error in Catch Admin Login", err);
        res.send({ error: err });
      });
  } catch (error) {
    console.log("Error in Admin Login", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/auth", function (req, res) {
  let token = req.headers.token;
  // console.log("Token in auth is ", token);
  try {
    const decode = jwt.verify(token, process.env.secretKey);
    // console.log("Decoded is ", decode);
    const Reftoken = jwt.sign(
      {
        email: decode.email,
        adminId: decode.adminId,
      },
      process.env.secretKey,
      // {
        // expiresIn: 420, // 7 min
        // expiresIn: "1h", // 7 min
      // }
    );
    res.status(200).json({
      flag: true,
      refreshedToken: Reftoken,
    });
  } catch (error) {
    res.status(401).json(false);
  }
});

// Category CRUD Starts
router.post("/addCategory", CheckAuth, (req, res) => {
  try {
    const newCategory = new CategoryModel({
      name: req.body.name,
      associatedTo: req.body.associatedTo,
      description: req.body.description,
    });
    newCategory
      .save()
      .then((result) => {
        res.status(201).json({
          message: "CategoryAdded",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/getCategory", CheckAuth, (req, res) => {
  try {
    CategoryModel.find()
      .exec()
      .then((result) => {
        res.status(200).json({
          success: 1,
          message: "Categories are fetched successfully",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          success: 0,
          message: "Error while calling getCategory",
          error: err.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: "Error while calling getCategory",
      error: error.message,
    });
  }
});

router.put("/updateCategory", CheckAuth, (req, res) => {
  try {
    CategoryModel.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        associatedTo: req.body.associatedTo,
        description: req.body.description,
      },
      function (err, responce) {
        if (err) {
          res.status(500).json({
            error: err.message,
          });
        } else {
          res.status(200).json({
            message: "CategoryUpdated",
            data: responce,
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.delete("/deleteCategory", CheckAuth, (req, res) => {
  try {
    let { categoryId } = req.query;
    CategoryModel.findByIdAndRemove(categoryId, function (err, responce) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json({
          message: "CategoryDeleted",
          data: responce,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
// Category CRUD Ends

// Business CRUD Starts
router.post(
  "/addBusiness",
  CheckAuth,
  upload.single("businessImage"),
  (req, res) => {
    try {
      if (req.Filerror) {
        return res.status(500).json({ message: "ImageError" });
      }

      let newBusiness = BusinessModel({
        name: req.body.name,
        discount: req.body.discount,
        description: req.body.description,
        date: req.body.date,
        category: req.body.category,
        liveFlag: req.body.liveFlag,
        image: req.file.path,
      });

      newBusiness
        .save()
        .then((result) => {
          console.log("In res");
          res.status(201).json({
            message: "BusinessAdded",
            data: result,
          });
        })
        .catch((err) => {
          console.log("err 1", err);
          res.status(500).json({
            error: err.message,
          });
        });
    } catch (error) {
      console.log("err 2", err);
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.get("/getBusiness", CheckAuth, (req, res) => {
  try {
    BusinessModel.find()
      .populate("category")
      .exec()
      .then((result) => {
        res.status(200).json({
          success: 1,
          message: "Business list fetched successfully",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          success: 0,
          message: "Error while fetching business",
          data: [],
          error: err.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: "Error while fetching business",
      data: [],
      error: error.message,
    });
  }
});

// not Working now ASK ALi about it
router.put("/updateBusiness", CheckAuth, (req, res) => {
  try {
    BusinessModel.findByIdAndUpdate(
      req.body.itemId,
      {
        name: req.body.name,
        discount: req.body.discount,
        description: req.body.description,
        date: req.body.date,
        category: req.body.category,
        live: req.body.live,
      },
      function (err, responce) {
        if (err) {
          res.status(500).json({
            error: err.message,
          });
        } else {
          res.status(200).json({
            message: "BusinessUpdated",
            data: responce,
          });
        }
      }
    );
  } catch (error) {
    console.log("err 2", err);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.delete("/deleteBusiness", CheckAuth, (req, res) => {
  try {
    let { businessId, imageId } = req.query;

    fs.unlink(imageId, function (err) {
      if (err) {
        console.log("Error in Delete File in Dish", err);
      }
      console.log("File is Deleted");
    }); // may caue Error handle it

    BusinessModel.findByIdAndRemove(businessId, function (err, responce) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json({
          message: "BusinessDeleted",
          data: responce,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
// Business CRUD Ends

// Event CRUD Starts
router.post("/addEvent", CheckAuth, upload.single("eventImage"), (req, res) => {
  try {
    if (req.Filerror) {
      return res.status(500).json({ message: "ImageError" });
    }

    let newEvent = EventModel({
      name: req.body.name,
      venue: req.body.venue,
      description: req.body.description,
      cost: req.body.cost,
      date: req.body.date,
      address: req.body.address,
      liveFlag: req.body.liveFlag,
      image: req.file.path,
    });

    newEvent
      .save()
      .then((result) => {
        res.status(201).json({
          message: "BusinessAdded",
          data: result,
        });
      })
      .catch((err) => {
        console.log("err 1", err);
        res.status(500).json({
          error: err.message,
        });
      });
  } catch (error) {
    console.log("err 2", err);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/getEvent", CheckAuth, (req, res) => {
  try {
    EventModel.find()
      .exec()
      .then((result) => {
        res.status(200).json({
          success: 1,
          message: "Events are fetched successfully",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          success: 0,
          message: "Error while fetching events",
          data: [],
          error: err.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: 0,
      message: "Error while fetching events",
      data: [],
      error: error.message,
    });
  }
});

router.delete("/deleteEvent", CheckAuth, (req, res) => {
  try {
    let { eventId, imageId } = req.query;

    fs.unlink(imageId, function (err) {
      if (err) {
        console.log("Error in Delete File in Dish", err);
      }
      console.log("File is Deleted");
    }); // may caue Error handle it

    EventModel.findByIdAndRemove(eventId, function (err, responce) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.status(200).json({
          message: "EventDeleted",
          data: responce,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
// Event CRUD Ends
module.exports = router;
