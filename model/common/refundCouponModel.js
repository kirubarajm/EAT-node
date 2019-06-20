"user strict";

var sql = require("../db.js");

var RefundCoupon = function(refund_coupon) {
  this.orderid = refund_coupon.orderid;
  this.refund_used_orderid = refund_coupon.refund_used_orderid;
  this.rcoupon =refund_coupon.rcoupon;
  this.refundamount =refund_coupon.refundamount;
  this.active_status =refund_coupon.active_status;
  this.userid =refund_coupon.userid;
  this.refund_balance =refund_coupon.refund_balance;
  this.refund_used_date_time =refund_coupon.refund_used_date_time;
};

//For Admin
RefundCoupon.createRefundCoupon = function createRefundCoupon(req, result) {
  //rc.orderid = req.orderid;
  //rc.refund_used_orderid = req.refund_used_orderid;
  //rc.refundamount =req.refundamount;
  //rc.userid =req.userid;
  //rc.refund_balance =req.refundamount;

  //need to add item missing contion
  console.log("ddd:"+req.orderid);
  sql.query("Select userid,price from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log(res);
      req.rcoupon ="Refund"+res[0].price;
      req.active_status = 1;
      req.userid = res[0].userid;
      req.refund_balance =res[0].price;
      req.refundamount =res[0].price;
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let sucobj = true;
            let message = "RefundCoupon created successfully";
            let resobj = {
              success: sucobj,
              message: message
            };
            result(null, resobj);
          }
        });
      
      };
    });
};


//For Admin
RefundCoupon.getAllrefundcoupon_by_activstatus = function getAllrefundcoupon_by_activstatus(active_status,result) {
  sql.query("Select * from Refund_Coupon where active_status=?",[active_status], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

//For EAT user to show in Order page
RefundCoupon.getarefundcoupon_by_userid = function getarefundcoupon_by_userid(userid,result) {
  sql.query("Select * from Refund_Coupon where userid=? and active_status=1 ORDER BY created_at DESC limit 1",[userid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};


//Once Eatuser use this RefundCoupon - Internal function
RefundCoupon.updateByRefundCouponId = function(rcid,refund_balance,refund_used_orderid) {
  //active_status = 0;
  //useddate = current date
  var useddate=new Date();
  
  sql.query(
    "UPDATE Refund_Coupon SET active_status=0,refund_used_date_time=?, refund_used_orderid=?, refund_balance=? WHERE rcid = ?",
    [useddate,refund_used_orderid,refund_balance,rcid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};


//Admin can remove refund coupon for userid if it only open
RefundCoupon.remove = function(rcid, result) {
  sql.query("DELETE FROM Refund_Coupon WHERE rcid = ? and active_status=1", [rcid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};


module.exports = RefundCoupon;
