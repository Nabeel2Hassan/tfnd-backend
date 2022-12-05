var express = require('express');
var router = express.Router();
var PaymentMethodController = require('../controllers/PaymentMethodController');
const checkAuth = require("../middleware/check.auth.admin");


/* Create Test Card Token*/
router.post('/create/card-token',checkAuth,PaymentMethodController.createToken);

/* Create Payment Method*/
router.post('/create',checkAuth,PaymentMethodController.create);

module.exports = router;