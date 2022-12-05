var express = require('express');
var router = express.Router();
var EventController = require('../controllers/EventController');
const checkAuth = require("../middleware/check.auth.admin");


/* Get the list of a event*/

router.get('/',checkAuth,EventController.index);

/* Get the details of a event*/

router.get('/:id',checkAuth,EventController.show);

module.exports = router;