'user strict';
var sql = require('../db.js');
var razorpayconst = require('../razorpay_constant');
var constant = require('../constant');
var request = require('request');
const https = require('https');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var Dunzoresponce = require("../common/dunzoresponceModel");
var Dunzomoveitdetails = require("../common/dunzomoveitdetailsModel");
var moment = require("moment");
var Notification = require("../common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");


//Task object constructor
var Razorpay = function(razorpay){
    this.makeit_userid = razorpay.makeit_userid;
    this.rating = razorpay.rating;
};

var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})

Razorpay.testingapi = function testingapi(req, result) {
  console.log("request ------>",req.payload.payment.entity.status);
    switch(req.payload.payment.entity.status){
        case razorpayconst.payment_authorized:
            console.log("authorized");
            break;
        case razorpayconst.payment_captured:
            console.log("captured");
            break;
        case razorpayconst.payment_failed:
            console.log("failed");
            break;
        case razorpayconst.refund_created:
            console.log("refund created");
            break;
        default:
            console.log("No State");
    }
    result(null, req);
};


module.exports= Razorpay;