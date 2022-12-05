var express = require('express');
var router = express.Router();
var BusinessController = require('../controllers/BusinessController');
const checkAuth = require("../middleware/check.auth.admin");

/* Get the list of a business*/

router.get('/',checkAuth,BusinessController.index);

/* Get the details of a business*/

router.get('/:id',checkAuth,BusinessController.show);

module.exports = router;