"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var constant = require("../constant");

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

  Coupon.get_coupons_by_admin = function get_coupons_by_admin(req,result) {

    sql.query("Select * from Coupon where active_status= 1 and expiry_date > NOW() ", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

      
          if (res.length !== 0 ) {

       ///       var kitchens =   await Coupon.getcouponlist(res,req)


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

          //  console.log("res");
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

      console.log("res[i].cid",res[i].cid);
      req.cid = res[i].cid;
      req.coupon_name = res[i].coupon_name;
      req.numberoftimes = res[i].numberoftimes;
      req.startdate = res[i].startdate;
      req.expiry_date = res[i].expiry_date;

 
      var couponinfo = await query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1 ",[req.eatuserid,req.cid]);
      // console.log("couponinfo[0].cnt",couponinfo[0].cnt);
      // console.log("req.numberoftimes",req.numberoftimes);
      if(couponinfo[0].cnt < req.numberoftimes){
       res[i].couponstatus = true;
      }else{
       res[i].couponstatus = false;
      // delete res[i];
     // res.splice(i);
      }

  
      if (res[i].coupon_type == 2 && res[i].couponstatus==true) {
 
        var get_user_created_at = await query("select date(created_at) as created_at from User where userid="+req.eatuserid+"");
        
        
        var dateFrom = moment(req.startdate).format("DD/MM/YYYY")
        var dateTo = moment(req.expiry_date).format("DD/MM/YYYY")
        var dateCheck =  moment(get_user_created_at[0].created_at).format("DD/MM/YYYY");

        console.log("dateFrom",dateFrom);
        console.log("dateTo",dateTo);
        console.log("dateCheck",dateCheck);
        
        var d1 = dateFrom.split("/");
        var d2 = dateTo.split("/");
        var c = dateCheck.split("/");

        var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
        var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
        var check = new Date(c[2], parseInt(c[1])-1, c[0]);

        if(check > from && check < to){
         
          res[i].couponstatus = true;
        }else{
          console.log("dateCheck1",dateCheck);
          res[i].couponstatus = false;
        }

        // console.log(check)
        // console.log(from)
        // console.log(check)
        // console.log(to)
        // console.log("req.coupon_type-------------------->",res[i].coupon_type);
        // console.log("res[i].couponstatus-------------------->", res[i].couponstatus);

      }else if (res[i].coupon_type == 3 && res[i].couponstatus==true) {
        
        var get_orders = await query("select * from Orders where userid="+req.eatuserid+" and orderstatus=6 and created_at >= '"+req.startdate+"' AND created_at <= '"+req.expiry_date+"'");


          if (get_orders.length !=0) {
            
            if (get_orders.length >= constant.user_montly_order) {
              res[i].couponstatus = true;
            } else{
              res[i].couponstatus = false;
            }

          }else{

            res[i].couponstatus = false;


          }

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
            sql.query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1",[req.userid,res[0].cid],async function(err, couponinfo) {
              if (err) {
                result(err, null);
              } else {
                  if(couponinfo[0].cnt<res[0].numberoftimes){

                    var message = '';
                    res[0].couponstatus = true;
                    if (res[0].coupon_type == 2) {
 
                      var get_user_created_at = await query("select date(created_at) as created_at from User where userid="+req.userid+"");
                      
                      
                      var dateFrom = moment(res[0].startdate).format("DD/MM/YYYY")
                      var dateTo = moment(res[0].expiry_date).format("DD/MM/YYYY")
                      var dateCheck =  moment(get_user_created_at[0].created_at).format("DD/MM/YYYY");
              
                      
                      var d1 = dateFrom.split("/");
                      var d2 = dateTo.split("/");
                      var c = dateCheck.split("/");
              
                      var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
                      var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
                      var check = new Date(c[2], parseInt(c[1])-1, c[0]);
                      console.log("dateCheck0",dateCheck);
                      if(check > from && check < to){
                       
                        res[0].couponstatus = true;
                         message= "Coupon valid"
                      }else{
                        console.log("dateCheck1",dateCheck);
                        res[0].couponstatus = false;
                         message= "Sorry! Your coupon not valid"
                      }
              
                      
              
                    }else if(res[0].coupon_type == 3 && res[0].couponstatus==true) {
        
                      var get_orders = await query("select * from Orders where userid="+req.userid+" and orderstatus=6 and created_at >= '"+res[0].startdate+"' AND created_at <= '"+res[0].expiry_date+"'");
              
                          console.log("---------",get_orders.length);
                        if (get_orders.length !=0) {
                          
                          if (get_orders.length >= constant.user_montly_order) {

                            res[0].couponstatus = true;
                            message= "Coupon valid"
                            console.log("---------",message);
                          } else{
                            res[0].couponstatus = false;
                            message= "Sorry! Your coupon not valid"
                            console.log("---------",message);

                          }
              
                        }else{
              
                          res[0].couponstatus = false
                          message= "Sorry! Your coupon not valid"
                          console.log("---------1",message);

              
                        }
              
                    } 
                   




                    let resobj = {
                      success: true,
                      status:res[0].couponstatus,
                      result: res,
                      message:message
                    };
                    result(null, resobj);
                  }else{
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
