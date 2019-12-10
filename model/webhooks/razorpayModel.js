'user strict';
var sql = require('../db.js');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var razorpayconst = require('../razorpay_constant');
var constant = require('../constant');
var Notification = require('../common/notificationModel');
var PushConstant = require("../../push/PushConstant.js");
//Task object constructor
var Razorpay = function(razorpay){
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

Razorpay.create_Razorpayresponse = async function create_Razorpayresponse(New_Razorpay) {
  console.log("=============================================> Razorpay Response Insert");
    sql.query("INSERT INTO Razorpay_response  set ?", New_Razorpay, function(err, res) {
        if (err) {
          console.log("error: ", err);
          return(err, null);
        } else {        
          let resobj = {
            success: true,
            status : true,
            message: "Razorpay_response created successfully"
          };    
          return(null, resobj);
        }
    });
};

Razorpay.order_success_update = async function order_success_update(New_Razorpay) {
  console.log("=============================================> Razorpay Order Success Update");
  var stringorderid = New_Razorpay.orderid;
  var orderid     = stringorderid.slice(9);
  var selectquery = "select * from  Orders where orderid="+orderid;
  sql.query(selectquery,function(err, res){
    if (err) {
      console.log("error: ", err);
      return(err, null);
    } else { 
      console.log("Order Success Details ===============>",res);
      if(res.length >1){
        if(res && res[0].orderstatus==0 && res[0].payment_type==1 && res[0].payment_status==0 && res[0].transactionid==null && res[0].transaction_status ==null){
          ////////start: Payment Auto Captured//////////////////////////
          //console.log("=============================================> Razorpay Auto Captured");
          //var paymentid  = New_Razorpay.payment_id;
          //var amount     = New_Razorpay.amount;
          //console.log("paymentid=====>",paymentid); console.log("amount=====>",parseInt(amount));
          //instance.payments.capture(paymentid, parseInt(amount));
          ////////end: Payment Auto Captured//////////////////////////
          var updatesuccessquery = "update Orders set captured_status=0,payment_status=1,transactionid='"+New_Razorpay.payment_id+"',transaction_status='success' where orderid="+orderid;
          
          sql.query(updatesuccessquery,function(err, res1){
            if (err) {
              console.log("error: ", err);
              return(err, null);
            }else{
               Notification.orderEatPushNotification(orderid,null,PushConstant.pageid_eat_razorpay_payment_success);
  
              let resobj = {
                success: true,
                status : true,
                message: "Order Updated successfully"
              };    
              return(null, resobj);
            }
          });
        }else{
          let resobj = {
            success: true,
            status : false,
            message: "Order Already Updated"
          };    
          return(null, resobj);
        } 
      }else{   }          
    }
  });
};

Razorpay.order_failed_update = async function order_failed_update(New_Razorpay) {
  console.log("=============================================> Razorpay Order Failed Update");
  var stringorderid = New_Razorpay.orderid;
  var orderid     = stringorderid.slice(9);
  var selectquery = "select * from  Orders where orderid="+orderid;
  sql.query(selectquery,function(err, res){
    if (err) {
      console.log("error: ", err);
      return(err, null);
    } else { 
      if(res.length>1){
        if(res && res[0].orderstatus==0 && res[0].payment_status==1 && res[0].transactionid==null && res[0].transaction_status ==null){
          var updatefailedquery = "update Orders set payment_status=2,transactionid='Canceled',transaction_status='failed' where orderid="+orderid;
          sql.query(updatefailedquery,function(err, res1){
            if (err) {
              console.log("error: ", err);
              return(err, null);
            }else{
              let resobj = {
                success: true,
                status : true,
                message: "Order Updated successfully"
              };    
              return(null, resobj);
            }
          });
        }else{
          let resobj = {
            success: true,
            status : false,
            message: "Order Already Updated"
          };    
          return(null, resobj);
        }
      } else{   }   
    }
  });
};

Razorpay.webhooks = function webhooks(req, result) {
  console.log("request ------>",req.payload.payment.entity.status);
    switch(req.payload.payment.entity.status){
      case razorpayconst.payment_authorized:
        console.log("=============================================> authorized",req);
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        New_Razorpay.orderid = req.payload.payment.entity.description;
        New_Razorpay.amount = req.payload.payment.entity.amount;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        New_Razorpay.payment_type = 1;
        Razorpay.create_Razorpayresponse(New_Razorpay);
        Razorpay.order_success_update(New_Razorpay);
        break;
      case razorpayconst.payment_captured:
        console.log("=============================================> captured",req);
        break;
      case razorpayconst.payment_failed:
        console.log("=============================================> failed",req);
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        New_Razorpay.orderid = req.payload.payment.entity.description;
        New_Razorpay.amount = req.payload.payment.entity.amount;
        New_Razorpay.payment_type = 2;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        Razorpay.create_Razorpayresponse(New_Razorpay);
        Razorpay.order_failed_update(New_Razorpay);
        break;
      default:
        console.log("=============================================> No State");
    }
    result(null, req);
};


module.exports= Razorpay;