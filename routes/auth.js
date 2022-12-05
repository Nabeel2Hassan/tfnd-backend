var express = require("express");
var router = express.Router();
var AuthController = require("../controllers/AuthController");
const checkAuth = require("../middleware/check.auth.admin");
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
  

/* Register User*/

router.post("/signup", AuthController.signup);

/* Login*/

router.post("/login", AuthController.login);

/* Profile*/

router.get("/profile", checkAuth, AuthController.profile);

/* Update Profile*/

router.put("/profile", checkAuth, AuthController.updateProfile);

/* Update Profile Image*/

router.put("/profile/image", checkAuth, upload.single("image"), AuthController.updateProfileImage);

//generating token and sending mail
router.post("/send-token",AuthController.sendToken)

//verifying token with get Method
router.get("/:userId/:token",AuthController.verifyToken)


//verifying token and resetting password
router.post("/verify-update-password/:token",AuthController.verifyAndUpdatePassword)


module.exports = router;
