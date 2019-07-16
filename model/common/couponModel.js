"user strict";

var sql = require("../db.js");
const util = require('util');

const query = util.promisify(sql.query).bind(sql);

var Coupon = function(coupon) {
  this.coupon_name = coupon.coupon_name;
  this.active_status = coupon.active_status;
}
//For Admin
Coupon.createCoupon = function createCoupon(req, result) {
 //need to add item missing contion
  console.log("ddd:"+req.orderid);
  req.active_status=0;
      sql.query("INSERT INTO Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let sucobj = true;
            let message = "Coupon created successfully";
            let resobj = {
              success: sucobj,
              message: message
            };
            result(null, resobj);
          }
        });
      
};


//For Admin
Coupon.getAllcoupon_by_activstatus = function getAllcoupon_by_activstatus(active_status,result) {
  sql.query("Select * from Coupon where active_status=?",[active_status], function(err, res) {
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

//Coupon enable/disable - Internal function
Coupon.updateByCouponId = function(cid,active_status) {
  //active_status = 0;
  //useddate = current date
  var useddate=new Date();
  sql.query(
    "UPDATE Coupon SET active_status=? WHERE cid = ?",
    [active_status, cid],
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


//Admin can remove coupon
Coupon.remove = function(cid, result) {
  sql.query("DELETE FROM Coupon WHERE cid = ? and active_status=1", [cid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Coupon.getAllcoupon_by_user = function getAllcoupon_by_user(userid,result) {
    sql.query("Select * from Coupon where active_status=?",[userid], function(err, res) {
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


  Coupon.get_coupons_by_userid = function get_coupons_by_userid(userid,result) {

    sql.query("Select * from Coupon where active_status= 1 limit 1", async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {

          if (res.length !== 0 ) {
            
            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);
          //   for (let i = 0; i < res.length; i++) {
          //     const element = array[index];
               
          //     var couponinfo = await query("select * from CouponsUsed where userid= '"+userid+"'");
          //   // sql.query( , function(err, couponinfo) {
          //   //   if (err) {
          //   //     console.log("error: ", err);
          //   //     result(null, err);
          //   //   } else {

          //     if (couponinfo.length <= 5) {
          //       let resobj = {
          //         success: true,
          //         status:true,
          //         result: res
          //       };
          //       result(null, resobj);
          //     }else{

          //       let resobj = {
          //         success: true,
          //         status:false,
          //         message: "Sorry Already Coupons used at maximum number of times"
          //       };
          //       result(null, resobj);

          //     }

                     
          //   //   }
          //   // });
          // }
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry there is no coupon"
            };
            result(null, resobj);
          }  
      }
    });
  };

module.exports = Coupon;
