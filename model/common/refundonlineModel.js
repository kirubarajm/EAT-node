"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var RefundOnline = function(refund) {
  this.orderid = refund.orderid;
  this.original_amt = refund.original_amt;
  this.refund_amt = refund.refund_amt ;
  this.active_status = refund.active_status;
  this.userid =refund.userid;
  this.payment_id =refund.payment_id;

};

RefundOnline.createRefund = async function createRefund(req, result) {

    const orderrefunddetails = await query("select * from Refund_Online where orderid ='" + req.orderid + "' and active_status=1");
    console.log(orderrefunddetails.length);
    if (orderrefunddetails.length===0) {
     
    sql.query("Select userid,price from Orders where orderid=? ",[req.orderid], function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res);
        req.rcoupon ="Refund"+res[0].price;
        req.active_status = 1;
        req.userid = res[0].userid;
        //req.refund_balance =res[0].price;
        req.original_amt =res[0].price;
        req.payment_id =res[0].transactionid;
        var rc =new RefundOnline(req);
        sql.query("INSERT INTO Refund_Online set ?",rc, function(err, res1) {
            if (err) result(err, null);
            else {
            let response = {
                success: true,
                status: true
            };
            result(null, response);
            }
        });
};
});
}else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry Refund online Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }
};

RefundOnline.get_all_refunds = function get_all_refunds(req, result) {
  sql.query("select * from Refund_Online", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundOnline.get_unsuccess_refunds = function get_unsuccess_refunds(
  req,
  result
) {
  sql.query("select * from Refund_Online Where status = 0", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundOnline.get_success_refunds = function get_success_refunds(req, result) {
  sql.query("select * from Refund_Online Where status = 1", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

module.exports = RefundOnline;
