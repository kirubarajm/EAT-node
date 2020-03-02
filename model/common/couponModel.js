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
  req.active_status=0;
      sql.query("INSERT INTO Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let resobj = {
              success: true,
              status:true,
              message: "Coupon created successfully"
            };
            result(null, resobj);
          }
        });
      
};


//For Admin
Coupon.getAllcoupon_by_activstatus = function getAllcoupon_by_activstatus(active_status,result) {
  sql.query("Select * from Coupon where active_status=?",[active_status], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
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
  sql.query(
    "UPDATE Coupon SET active_status=? WHERE cid = ?",
    [active_status, cid],
    function(err, res) {
      if (err) {
        result(err, null);
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
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Coupon.getAllcoupon_by_user = function getAllcoupon_by_user(userid,result) {
    sql.query("Select * from Coupon where active_status=?",[userid], function(err, res) {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    });
  };


  Coupon.get_coupons_by_userid = function get_coupons_by_userid(req,result) {

    sql.query("Select * from Coupon where active_status= 1 and expiry_date > NOW() ", async function(err, res) {
      if (err) {
        result(err, null);
      } else {
      
          if (res.length !== 0 ) {

              var kitchens =   await Coupon.getcouponlist(res,req)


            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);
      
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry there is no coupon",
              result: res
            };
            result(null, resobj);
          }  
      }
    });
  };

  Coupon.get_coupons_by_userid_new = function get_coupons_by_userid_new(eatuserid,result) {

    sql.query("Select * from Coupon where active_status= 1 and expiry_date > NOW() ", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

          var req = {};

          req.eatuserid = eatuserid;

          if (res.length !== 0 ) {

              var kitchens =   await Coupon.getcouponlist(res,req)


            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);
      
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


  Coupon.getcouponlist = async function(res,req){

    for (let i = 0; i < res.length; i++) {
      req.cid = res[i].cid;
      req.coupon_name = res[i].coupon_name;
      req.numberoftimes = res[i].numberoftimes;

 
      var couponinfo = await query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1 ",[req.eatuserid,req.cid]);
      //console.log(couponinfo[0].cnt);
      if(couponinfo[0].cnt < req.numberoftimes){
       res[i].couponstatus = true;
      }else{
       res[i].couponstatus = false;
      // delete res[i];
     // res.splice(i);
      }


      if (req.coupon_type ==2 && res[i].couponstatus==true) {
        
  
        var get_user_created_at = await query("select date(created_at) as created_at from User where userid="+req.eatuserid+"");
        
        
        var dateFrom = "02/03/2020";
        var dateTo = "30/03/2020";
        var dateCheck = "02/03/2020";

        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        var c = dateCheck.split("/");

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        var check = new Date(c[2], parseInt(c[1])-1, c[0]);

        console.log(check > from && check < to)


      }
     

    }
  
  return res
  }
  




  Coupon.coupons_validate_by_userid = async function coupons_validate_by_userid(req,result) {

    sql.query("Select * from Coupon where active_status= 1 and coupon_name = '"+req.coupon_name+"' and expiry_date > NOW() limit 1", async function(err, res) {
      if (err) {
        result(err, null);
      } else {
          if (res.length !== 0 ) {
            sql.query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1  ",[req.userid,res[0].cid], function(err, couponinfo) {
              if (err) {
                result(err, null);
              } else {
                  if(couponinfo[0].cnt<res[0].numberoftimes)
                  {
                    let resobj = {
                      success: true,
                      status:true,
                      result: res
                    };
                    result(null, resobj);
                  }
                  else
                  {
                  let resobj = {
                    success:true,
                    status: false,
                    result: res,
                    message: "Already Coupons used at maximum number of times"
                  };
                  result(null, resobj);
                  }
              }
            });
            
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry coupon is not Valid !"
            };
            result(null, resobj);
          }  
      }
    });
  };

module.exports = Coupon;
