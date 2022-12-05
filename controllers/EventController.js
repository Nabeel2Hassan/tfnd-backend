const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const CategoryModel = require("../models/category.model");
const EventModel = require("../models/event.model");
const jwt = require("jsonwebtoken");
const CheckAuth = require("../middleware/check.auth.admin");
const multer = require("multer");
var fs = require("fs"); // file system

exports.index = function(req, res ,  next) {
    EventModel.find({} , function(err , docs){
      console.log("The data is:" , docs);
      if(err){
        console.log("Error id :" , err);
        res.status(501).json({
          error: err
        });
      }
      var data = docs;
      res.status(200).json(docs);
    });
  
  }

exports.show = function(req, res ,  next) {
    const id = req.params.id;
    console.log("Id : ", id);
    EventModel.findOne({_id:id} , function(err , docs){
      console.log("The data is:" , docs);
      if(err){
        console.log("Error id :" , err);
        res.status(501).json({
          error: err
        });
      }
      var data = docs;
      res.status(200).json(docs);
    });
  
  }