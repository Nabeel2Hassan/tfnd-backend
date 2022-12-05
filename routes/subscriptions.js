var express = require('express');
var router = express.Router();
var SubscriptionController = require('../controllers/SubscriptionController');
const checkAuth = require("../middleware/check.auth.admin");


/* Get the details of a business*/

router.get('/packages',checkAuth,SubscriptionController.packages);
router.get('/setup-intent',checkAuth,SubscriptionController.setupIntent);
router.post('/create-subscription',checkAuth,SubscriptionController.createSubscription);
router.post('/confirm-payment',checkAuth,SubscriptionController.confirmPayment);
router.post('/cancel-subscription',checkAuth,SubscriptionController.cancelSubscription);
router.post('/save-subscription',checkAuth,SubscriptionController.saveSubscription);
router.post('/stripe-webhook',SubscriptionController.stripeWebhook);



module.exports = router;