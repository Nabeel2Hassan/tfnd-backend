const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const CategoryModel = require("../models/category.model");
const BusinessModel = require("../models/business.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
var fs = require("fs"); // file system
const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce((obj, key) =>
      (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}

exports.index = async function (req, res, next) {
  try {
    // What if user is willing to paginate
    const recordsToBeShownPerPage = getNestedObject(req , ["params" , "size"]) || 10;
    const recordStartingFrom = getNestedObject(req , ["params" , "offset"]) || 0;

    let query = { $and : []};
    // What if category is posted
    const { category , search } = req.query; 
    if(category && (category || '').trim().length ){
      query.$and.push({ category });
    }
    // What if user is willing to search
    if(search && (search || '').trim().length ){
      query.$and.push( { name : { $regex : search } });
    }
    if(query.$and.length == 0){
      query = {};
    }
    const businessList = await 
    BusinessModel.find(query)
    .limit(recordsToBeShownPerPage)
    .skip(recordStartingFrom)
    .lean();

    res.status(200).json({
      success: 1,
      message: "Business are fetched successfully.",
      data: businessList,
      meta : {
        size:recordsToBeShownPerPage ,
        offset : recordStartingFrom
      }
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
