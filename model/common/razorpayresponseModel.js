"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Razorpayresponse = function(razorpayresponse) {
  this.payment_id = razorpayresponse.payment_id || 0;
  this.orderid = razorpayresponse.orderid || 0;
  this.razorpay_response = razorpayresponse.razorpay_response;
};

Razorpayresponse.create_Razorpayresponse = async function create_Razorpayresponse(new_Razorpayresponse, result) {

    sql.query("INSERT INTO Razorpay_response  set ?", new_Razorpayresponse, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Razorpay_response created successfully"
          };
    
          result(null, resobj);
        }
      });
  
};







module.exports = Razorpayresponse;
