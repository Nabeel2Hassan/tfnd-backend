const express = require("express");
const UserModel = require("../models/user.model");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createToken = async function (req, res, next) {
  try {
    const token = await stripe.tokens.create({
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
      },
    });

    res.status(200).json({
      success: 1,
      message: "Card token created successfully.",
      data: token,
    });
  } catch (error) {
    console.log("Error while creating card token", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.create = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await UserModel.findById({ _id: id });

    const source = await stripe.customers.createSource(
      user.stripe_customer_id,
      {
        source: req.body.stripe_token,
      }
    );

    if (
      source.last4 == user.credit_card_last_four && source.brand == user.credit_card_brand) {
      res.json({
        success: 0,
        message: "Payment method already exists",
        data: [],
      });
    } else {
      const isUpdated = await UserModel.findByIdAndUpdate(
        { _id: id },
        {
            credit_card_secret: source.id,
            credit_card_last_four: source.last4,
            credit_card_exp_month: source.exp_month,
            credit_card_exp_year: source.exp_year,
            credit_card_brand: source.brand,
         },
        { new: true }
      );
      res.status(200).json({
        success: 1,
        message: "Payment method added successfully.",
        data: source,
      });
    }
  } catch (error) {
    console.log("Error while adding payment method", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};
