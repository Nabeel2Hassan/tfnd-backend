const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const subscriptionPackageModel = require("../models/subscriptionPackages.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
const UserModel = require("../models/user.model");
const SubscriptionModel = require("../models/subscriptions.model");
const moment = require("moment");
var fs = require("fs"); // file system
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.packages = async function (req, res, next) {
  try {
    const subscriptionList = await subscriptionPackageModel.find({}).lean();

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
      data: [],
    });
  }
};

exports.setupIntent = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripe_customer_id,
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: 1,
      message: "Setup intent created successfully.",
      data: setupIntent,
    });
  } catch (error) {
    console.log("Error while creating setupp intent", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.createSubscription = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });

    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      default_payment_method: user.credit_card_secret,
      off_session: true,
      items: [{ price: req.body.price }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json({
      success: 1,
      message: "Subscription created successfully.",
      data: subscription,
    });
  } catch (error) {
    console.log("Error while creating subscription", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.confirmPayment = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });

    const paymentIntent = await stripe.paymentIntents.confirm(
      req.body.payment_intent,
      { payment_method: "pm_card_visa" }
    );

    res.status(200).json({
      success: 1,
      message: "Payment intent confirmation succeeded.",
      data: paymentIntent,
    });
  } catch (error) {
    console.log("Error while payment confirmation", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.cancelSubscription = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });

    const paymentIntent = await stripe.paymentIntents.confirm(
      req.body.payment_intent,
      { payment_method: "pm_card_visa" }
    );

    res.status(200).json({
      success: 1,
      message: "Subscription cancelled successfully.",
      data: paymentIntent,
    });
  } catch (error) {
    console.log("Error while cancelling subscription", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.saveSubscription = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });

    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.body.payment_intent
    );

    if (paymentIntent.invoice) {
      var invoice = await stripe.invoices.retrieve(paymentIntent.invoice, []);
      var subscriptionId = invoice.subscription;
    }

    if (subscriptionId) {
      var subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    const x = moment(1670298895).format('"DD MM YYYY hh:mm:ss"');
    var day = moment.unix(1670212495);

    const subscriptionModel = await SubscriptionModel.create({
      user_id: id,
      subscription_package_id: req.body.subscription_package_id,
      from_date: moment.unix(subscription.current_period_start),
      to_date: moment.unix(subscription.current_period_end),
      purchased_on: moment.unix(subscription.created),
      amount: subscription.plan.amount / 100,
      current_status: subscription.status,
    });

    const isUpdated = await UserModel.findByIdAndUpdate(
      { _id: id },
      { subscription: req.body.subscription_package_id },
      { new: true }
    );

    res.status(200).json({
      success: 1,
      message: "Subscription saved successfully.",
      data: subscriptionModel,
    });
  } catch (error) {
    console.log("Error while saving subscription", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.stripeWebhook = async function (req, res, next) {
  try {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const sig = req.headers["stripe-signature"];
    let { type , data }= req.body;
    console.log("event body is");
    console.log("Request :" ,{type , data } );
    let event = req.body;

    // try {
    //   event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    // } catch (err) {
    //   console.error(err);
    //   res.status(400).send(`Webhook Error: ${err.message}`);
    //   return;
    // }

    // Handle the event
    console.log("event type is", event.type);
    switch (event.type) {
      case "charge.captured": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.captured
        break;
      }
      case "charge.expired": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.expired
        break;
      }
      case "charge.failed": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.failed
        break;
      }
      case "charge.pending": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.pending
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.refunded
        break;
      }
      case "charge.succeeded": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.succeeded
        break;
      }
      case "charge.updated": {
        const charge = event.data.object;
        // Then define and call a function to handle the event charge.updated
        break;
      }
      case "charge.dispute.closed": {
        const dispute = event.data.object;
        // Then define and call a function to handle the event charge.dispute.closed
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object;
        // Then define and call a function to handle the event charge.dispute.created
        break;
      }
      case "charge.dispute.funds_reinstated": {
        const dispute = event.data.object;
        // Then define and call a function to handle the event charge.dispute.funds_reinstated
        break;
      }
      case "charge.dispute.funds_withdrawn": {
        const dispute = event.data.object;
        // Then define and call a function to handle the event charge.dispute.funds_withdrawn
        break;
      }
      case "charge.dispute.updated": {
        const dispute = event.data.object;
        // Then define and call a function to handle the event charge.dispute.updated
        break;
      }
      case "charge.refund.updated": {
        const refund = event.data.object;
        // Then define and call a function to handle the event charge.refund.updated
        break;
      }
      case "payment_intent.amount_capturable_updated": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        break;
      }
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        break;
      }
      case "payment_intent.created": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
        break;
      }
      case "payment_intent.partially_funded": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      }
      case "payment_intent.processing": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
        break;
      }
      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      }
      case "subscription_schedule.aborted": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.aborted
        break;
      }
      case "subscription_schedule.canceled": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.canceled
        break;
      }
      case "subscription_schedule.completed": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.completed
        break;
      }
      case "subscription_schedule.created": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.created
        break;
      }
      case "subscription_schedule.expiring": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.expiring
        break;
      }
      case "subscription_schedule.released": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.released
        break;
      }
      case "subscription_schedule.updated": {
        const subscriptionSchedule = event.data.object;
        // Then define and call a function to handle the event subscription_schedule.updated
        break;
      }
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({
      success: 1,
      message: "Stripe webhook event received successfully.",
      data: 'Webhook response',
    });
  } catch (error) {
    console.log("Error while stripe webhook event", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};
