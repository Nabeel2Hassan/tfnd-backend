const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const CategoryModel = require("../models/category.model");
const BusinessModel = require("../models/business.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
var fs = require("fs"); // file system

exports.index = async function (req, res, next) {
  try {
    
    const queryObj = req.query;
    const businessList = await BusinessModel.find(queryObj).lean();

    res.status(200).json({
      success: 1,
      message: "Business are fetched successfully.",
      data: businessList,
    });
  } catch (error) {
    console.log("Error while fetching business list", error);
    return res.json({
      success: 0,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.show = function (req, res, next) {
  const id = req.params.id;
  console.log("Id : ", id);
  BusinessModel.findOne({ _id: id }, function (err, docs) {
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
