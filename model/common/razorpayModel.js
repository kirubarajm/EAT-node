"user strict";
var sql = require("../db.js");
const util = require("util");
const Rpay = require("razorpay");
var constant = require("../constant.js");

var instance = new Rpay({
    key_id: "rzp_test_3cduMl5T89iR9G",
    key_secret: "BSdpKV1M07sH9cucL5uzVnol"
  });

  const query = util.promisify(sql.query).bind(sql);


  var Razorpay = function(razorpay) {
    this.orderid = refund.orderid;
    this.original_amt = refund.original_amt;
    this.refund_amt = refund.refund_amt ;
    this.active_status = refund.active_status;
    this.userid =refund.userid;
    this.payment_id =refund.payment_id;
  };
  
// customer id generation

Razorpay.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userinfo) {
    var name = userinfo[0].name;
    var email = userinfo[0].email;
    var contact = userinfo[0].phoneno;
    var notes = "eatuser";
    var cuId = false;
  
    return await instance.customers
      .create({ name, email, contact, notes })
      .then(data => {
        cuId = data.id;
        //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
  
        sql.query(
          "UPDATE User SET razer_customerid ='" +
            data.id +
            "'  where userid = " +
            userinfo[0].userid +
            " ",
          function(err, customerupdate) {
            if (err) {
              console.log("error: ", err);
              //  return false;
            }
          }
        );
        console.log("cuId:----- ", cuId);
        return cuId;
      })
      .catch(error => {
        console.log("error: ", error);
        return false;
      });
  };

  // Partial refund for a payment
  Razorpay.razorpay_refund_payment_by_paymentid = async function razorpay_refund_payment_by_paymentid(req,result) {
    
    const servicecharge = constant.servicecharge;
    
    if (req.cancel_by&& req.cancel_by===1) {
       var amount= req.amount - servicecharge;
    }else{
        var amount= req.amount;
    }
    // instance.payments. refund(req.paymentid, {
    // amount: 10,

    instance.payments.refund(req.paymentid, {
    amount: amount,
    notes: {
      note1: 'Refund amount'
    }
  }).then((data) => {
    // success
    updatequery = "update Refund_Online set active_status= 0,refund_amt = '"+data.amount+"',payment_id='"+data.id+"' where rs_id ='" + req.rs_id + "'"
    
    sql.query(updatequery, function (err, res) {
        if(err) {
            console.log("error: ", err);
              result(null, err);
           }
         else{   
         
             var  message = "Amount refunded successfully"
          
              let sucobj=true;
              let resobj = {  
                success: sucobj,
                status:true,
                message:message,
                result:data,
                }; 
  
             result(null, resobj);
              }
    }); 

  }).catch((error) => {
    console.error(error)
    let resobj = {
        success: true,
        status: false,
        result: error
    };
    result(null, resobj);
    // error
  })
};

  module.exports = Razorpay;