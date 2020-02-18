'user strict';
var sql = require('../db.js');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var razorpayconst = require('../razorpay_constant');
var constant = require('../constant');
var Notification = require('../common/notificationModel');
var PushConstant = require("../../push/PushConstant.js");
var Razorpay = require("razorpay");
var Onlineautorefund = require('../common/Online_autorefundModel.js');
//Task object constructor
var ZendeskWebhook = function(zendeskWebhook){
    this.payment_id = razorpay.payment_id || 0;
    this.orderid = razorpay.orderid || 0;
    this.razorpay_response = razorpay.razorpay_response;
    this.amount = razorpay.amount || 0;
    this.payment_type = razorpay.payment_type || 0;
};

var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})



ZendeskWebhook.webhooks = function webhooks(req, result) {
  console.log("request ------>",req.payload.payment.entity.status);
    switch(req.payload.payment.entity.status){
      case razorpayconst.payment_authorized:
        console.log("=============================================> authorized");
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        var stringorderid       = req.payload.payment.entity.description;
        //New_Razorpay.orderid    = stringorderid.slice(9);
        var stringorderidarray  = stringorderid.match(/(\d+)/);
        New_Razorpay.orderid    = stringorderidarray[0];
        New_Razorpay.amount     = req.payload.payment.entity.amount;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        New_Razorpay.payment_type = 1;
        RazorpayWebhook.create_Razorpayresponse(New_Razorpay);
        RazorpayWebhook.order_success_update(New_Razorpay);
        break;
      case razorpayconst.payment_captured:
        console.log("=============================================> captured");
        break;
      case razorpayconst.payment_failed:
        console.log("=============================================> failed");
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        var stringorderid       = req.payload.payment.entity.description;
        //New_Razorpay.orderid    = stringorderid.slice(9);
        var stringorderidarray  = stringorderid.match(/(\d+)/);
        New_Razorpay.orderid    = stringorderidarray[0];
        New_Razorpay.amount = req.payload.payment.entity.amount;
        New_Razorpay.payment_type = 2;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        RazorpayWebhook.create_Razorpayresponse(New_Razorpay);
        ////RazorpayWebhook.order_failed_update(New_Razorpay);
        break;
      default:
        console.log("=============================================> No State");
    }
    result(null, req);
};


module.exports= ZendeskWebhook;