"user strict";
var sql = require("../db.js");
const util = require("util");
var Orderitem = require("../../model/common/orderItemsModel.js");
var MoveitRatingForMakeit = require("../../model/moveit/moveitRatingForMakeitModel");
var Orderlock = require("../../model/common/lockorderModel");
var master = require("../master");
var constant = require("../constant.js");
var Makeituser = require("../../model/makeit/makeitUserModel.js");
var Notification = require("../../model/common/notificationModel.js");
var moment = require("moment");
const Razorpay = require("razorpay");
var PushConstant = require("../../push/PushConstant.js");
var RefundCoupon = require("../../model/common/refundCouponModel");
var RefundOnline = require("../../model/common/refundonlineModel");
var CouponUsed = require("../../model/common/couponUsedModel");

// var instance = new Razorpay({
//   key_id: "rzp_test_3cduMl5T89iR9G",
//   key_secret: "BSdpKV1M07sH9cucL5uzVnol"
// });

var instance = new Razorpay({
  key_id: 'rzp_live_BLJVf00DRLWexs',
  key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
})
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Order = function(order) {
  this.userid = order.userid;
  this.locality = order.locality;
  this.delivery_charge = order.delivery_charge;
  this.ordertype = order.ordertype || 0;
  this.orderstatus = order.orderstatus || 0;
  this.gst = order.gst;
  this.coupon = order.coupon;
  this.payment_type = order.payment_type;
  this.makeit_user_id = order.makeit_user_id;
  this.moveit_user_id = order.moveit_user_id || 0;
  this.cus_lat = order.cus_lat;
  this.cus_lon = order.cus_lon;
  this.makeit_status = order.makeit_status || "0";
  this.moveit_expected_delivered_time = order.moveit_expected_delivered_time;
  this.moveit_actual_delivered_time = order.moveit_actual_delivered_time;
  this.moveit_remarks_order = order.moveit_remarks_order;
  this.makeit_expected_preparing_time = order.makeit_expected_preparing_time;
  this.makeit_actual_preparing_time = order.makeit_actual_preparing_time;
  this.price = order.price || 0;
  this.payment_status = order.payment_status || 0;
  this.cus_address = order.cus_address;
  this.lock_status = order.lock_status || 0;
  this.cancel_by = order.cancel_by || 0;
  this.item_missing = order.item_missing || 0;
  this.original_price = order.original_price;
  this.refund_amount = order.refund_amount;
  this.discount_amount = order.discount_amount;
  this.address_title = order.address_title;
  this.locality_name = order.locality_name;
  this.cancel_reason = order.cancel_reason;
};

Order.createOrder = async function createOrder(req, orderitems, result) {
  try {
    const res = await query( "select count(*) as count from Orders where orderstatus < 6 and lock_status = 0 and userid= '" +
        req.userid +
        "'"
    );
    if (res[0].count === 0) {
      Makeituser.read_a_cartdetails_makeitid(req, orderitems,false,async function(err,res3) {
        if (err) {
          result(err, null);
        } else {
          if (res3.status != true) {
            result(null, res3);
          } else {
            var amountdata = res3.result[0].amountdetails;
            var address_data = await query("Select * from Address where aid = '" + req.aid + "'");
            req.cus_address = address_data[0].address;
            req.locality = address_data[0].locality;
            req.cus_lat = address_data[0].lat;
            req.cus_lon = address_data[0].lon;

            req.gst = amountdata.gstcharge;
            req.price = amountdata.grandtotal;
            
           Order.OrderInsert(req, res3.result[0].item,false,false,async function(err,res){
            if (err) {
              result(err, null);
            } else {
              await Notification.orderMakeItPushNotification(
                res.orderid,
                req.makeit_user_id,
                PushConstant.pageidMakeit_Order_Post
              );
              result(null, res);
            }
           });
           //ordercreatecashondelivery(req, res3.result[0].item);
          }
        }
      });
    } else {
      let resobj = {
        success: true,
        status: false,
        message: "Already you have one order, So please try once delivered exiting order"
      };
      result(resobj,null);
    }
  } catch (error) {
    let resobj = {
      success: true,
      status: false,
      errorCode: 402
    };
    result(resobj, null);
  }
};

Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(req,orderitems,result) {

  const delivery_charge = constant.deliverycharge;
  const res = await query("select count(*) as count from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
  if (res[0].count === 0) {
    const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
    //console.log("address_data-->",address_data);
    if(address_data.length === 0) {
      let resobj = {
                success: true,
                status: false,
                message: "Sorry your slected address wrong.Please select correct address."
              };
              result(null, resobj);
      }else{
            req.lat = address_data[0].lat;
            req.lon = address_data[0].lon;
            Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
              if (err) {
                result(err, null);
              } else {
                if (res3.status != true) {
                  result(null, res3);
                } else {
                  var amountdata = res3.result[0].amountdetails;
        
                  req.original_price = amountdata.original_price;
                  req.refund_balance = amountdata.refund_balance;
                  req.refund_amount = amountdata.refundamount;
                  req.discount_amount = amountdata.coupon_discount_amount;
                  req.after_discount_cost = amountdata.grandtotal;
                  req.order_cost   = amountdata.original_price;
                  req.gst = amountdata.gstcharge;
                  req.price = amountdata.grandtotal;
        
                  req.cus_address = address_data[0].address;
                  req.locality = address_data[0].locality;
                  req.cus_lat = address_data[0].lat;
                  req.cus_lon = address_data[0].lon;
                  req.address_title = address_data[0].address_title;
                  req.locality_name = address_data[0].locality;
                    if (req.payment_type === 0) {
                      Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                        if (err) {
                          result(err, null);
                        } else {
                          await Notification.orderMakeItPushNotification(
                            res.orderid,
                            req.makeit_user_id,
                            PushConstant.pageidMakeit_Order_Post
                          );
                          result(null, res);
                        }
                      });
                      //ordercreatecashondelivery(req, res3.result[0].item);
                    } else if (req.payment_type === 1) {
                      Order.OrderOnline(req, res3.result[0].item,function(err,res){
                        if (err) {
                          result(err, null);
                        } else {
                          result(null, res);
                        }
                      });
                      //ordercreateonline(req, res3.result[0].item);
                    }
                }
              }
            });
      }

    async function ordercreateonline(req, orderitems) {

      ///  console.log(req);

        var customerid = await Order.create_customerid_by_razorpay(req.userid);
        // console.log("customerid:----- ", customerid);
        // if (!customerid) {
        //   let resobj = {
        //     success: true,
        //     status: false,
        //     message:
        //       "Sorry can't create the order due to customerid not yet generate"
        //   };
        //   result(null, resobj);
        //   return;
        // }
        if (customerid === 400) {
          let resobj = {
            success: true,
            status: false,
           // message: "Sorry can't create customerid format is invalid"
           message: "Customer already exists for the merchant!"
          };
        result(null,resobj );
        return
      }

      var new_Order = new Order(req);
      new_Order.delivery_charge = delivery_charge;
      new_Order.lock_status = 1;

      sql.query("INSERT INTO Orders set ?", new_Order, async function(err,res1) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          var orderid = res1.insertId;

          for (var i = 0; i < orderitems.length; i++) {
            //  console.log(orderitems[i].productid);
            var orderitem = {};
            orderitem.orderid = orderid;
            orderitem.productid = orderitems[i].productid;
            orderitem.quantity = orderitems[i].cartquantity;
            orderitem.price = orderitems[i].price;
            var items = new Orderitem(orderitem);

            var orderitemlock = {};
            orderitemlock.productid = orderitems[i].productid;
            orderitemlock.quantity = orderitems[i].cartquantity;
            orderitemlock.orderid = orderid;
            orderitemlock = new Orderlock(orderitemlock);

            orderitemlock.orderid = orderid;

            Orderitem.createOrderitems(items, function(err, res2) {
              if (err) result.send(err);
            });

            Orderlock.lockOrderitems(orderitemlock, function(
              err,
              orderlockresponce
            ) {
              if (err) result.send(err);
            });
          }

          let mesobj = "Order Created successfully";
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true,
            message: mesobj,
            price: new_Order.price,
            razer_customerid: customerid,
            refund_balance: req.refund_balance,
            orderid: orderid
          };

          result(null, resobj);
        }
      });
    }
  } else {
    let sucobj = true;
    let status = false;
    let mesobj =
      "Already you have one order, So please try once delivered exiting order";
    let resobj = {
      success: sucobj,
      status: status,
      message: mesobj
    };
    result(null, resobj);
  }
  
};

Order.OrderOnline = async function OrderOnline(req, orderitems,result) {
  var customerid = await Order.create_customerid_by_razorpay(req.userid);
  if (!customerid) {
      let resobj = {
        success: true,
        status: false,
        message: "Customer already exists for the merchant!"
      };
    result(null,resobj );
    return
  }

  Order.OrderInsert(req, orderitems,true,true,function(err,res){
    if (err) {
      result(err, null);
    } else {
      res.price=req.price;
      res.razer_customerid=customerid,
      res.refund_balance=req.refund_balance,
      result(null, res);
    }
  });
}

Order.OrderInsert = async function OrderInsert(req, orderitems,isMobile,isOnlineOrder,result) {
  var new_Order = new Order(req);
  new_Order.delivery_charge = constant.deliverycharge;
  sql.beginTransaction(function(err) {
    if (err) { 
      sql.rollback(function() {
        result(err, null);
      });
      return;
    }
    sql.query("INSERT INTO Orders set ?", new_Order, async function(err, res1) {
      if (err) { 
        sql.rollback(function() {
          result(err, null); //result.send(err);
        });
      }else{
        var orderid = res1.insertId;
        for (var i = 0; i < orderitems.length; i++) {
          var orderitem = {};
          orderitem.orderid = orderid;
          orderitem.productid = orderitems[i].productid;
          orderitem.quantity = orderitems[i].cartquantity;
          orderitem.price = orderitems[i].price;
          var items = new Orderitem(orderitem);
          Orderitem.createOrderitems(items, function(err, res2) {
            //if (err) result.send(err);
            if (err) { 
              sql.rollback(function() {
                result(err, null);
              });
            }
          });

          if(isOnlineOrder) {
            var orderitemlock = new Orderlock(orderitem);
            Orderlock.lockOrderitems(orderitemlock, function(
              err,
              orderlockresponce
            ) {
              if (err) { 
                sql.rollback(function() {
                  result(err, null);
                });
              }//result.send(err);
            });
          }
        }

        if(isMobile&&!isOnlineOrder){
          if (req.cid) {
            var new_createCouponUsed = new CouponUsed(req); 
            new_createCouponUsed.orderid = res1.insertId;
            CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
               //if (err) result.send(err);
               if (err) { 
                sql.rollback(function() {
                  result.send(err);
                });
              }
             });
           }


         if (req.rcid) {
           var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(req.rcid,req.refund_balance,res1.insertId);
         }
        }

        let resobj = {
          success: true,
          status: true,
          message: "Order Created successfully",
          orderid: orderid
        };
        sql.commit(async function(err) {
          if (err) { 
            sql.rollback(function() {
              //result.send(err);
              result(err, null);
            });
          }
          
          result(null, resobj);
        });
      }
    });
  });
}

Order.online_order_place_conformation = async function(order_place, result) {
  var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var transaction_status= order_place.payment_status === 1? 'success':'failed';
  var orderUpdateQuery =
  "update Orders set payment_status = '" +
  order_place.payment_status +
  "', lock_status = 0,transactionid='" +
  order_place.transactionid +
  "',transaction_status= "+transaction_status+", transaction_time= '" +
  transaction_time +
  "' WHERE orderid = '" +
  order_place.orderid +
  "' ";

  sql.query(orderUpdateQuery, async function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      if (order_place.payment_status === 1) {
        if (order_place.cid) {
          const orderdetailsquery = "select * from Orders where orderid ='" +order_place.orderid +"'";
          sql.query(orderdetailsquery, async function(err, orderdetails) {
            if (err) {
              result(err, null);
            }else{
              var new_createCouponUsed = new CouponUsed(order_place); 
              new_createCouponUsed.after_discount_cost = orderdetails[0].price
              new_createCouponUsed.order_cost = orderdetails[0].original_price
              new_createCouponUsed.userid = orderdetails[0].userid
          
              CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
                if (err) {
                  result(err, null);
                  return;
                }
              });
            }
          });
         }
    
        if (order_place.refund_balance) {
          var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(
            order_place.rcid,
            order_place.refund_balance,
            order_place.orderid
          );
        }

        var deletequery ="delete from Lock_order where orderid ='" + order_place.orderid + "' ";
        sql.query(deletequery, async function(err, deleteres) {
          if (err) {
            result(err, null);
          } else {
            await Notification.orderMakeItPushNotification(
              order_place.orderid,
              null,
              PushConstant.pageidMakeit_Order_Post
            );

            let resobj = {
              success: true,
              status: true,
              message: "Your order placed successfully"
            };
            result(null, resobj);
          }
        });
      }else if (order_place.payment_status == 2) {
        var releasequantityquery = "select * from Lock_order where orderid ='" + order_place.orderid + "' ";
        sql.query(releasequantityquery, function(err, res2) {
          if (err) {
            result(err, null);
          } else {
            for (let i = 0; i < res2.length; i++) {
              var productquantityadd =
                "update Product set quantity = quantity+" +
                res2[i].quantity +
                " where productid =" +
                res2[i].productid +
                "";
              sql.query(productquantityadd, function(err, res2) {
                if (err) {
                  result(err, null);
                }
              });
            }

            let resobj = {
              success: true,
              message: "Sorry payment not yet be paid following order",
              status: false,
              orderid: order_place.orderid
            };
            result(null, resobj);
          }
        });
      }
    }
  });
};

Order.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from Orders where orderid = ? ", orderid, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.updateOrderStatus = function updateOrderStatus(req, result) {
  sql.query(
    "Update Orders set orderstatus = ? where orderid = ? ",
    [req.orderstatus, req.orderid],
    async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (req.orderstatus === PushConstant.masteridOrder_Accept) {
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_accept
          );
        } else if (req.orderstatus === PushConstant.masteridOrder_Prepared) {
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.masteridOrder_Prepared
          );
        }

        let res = {
          success: true,
          status: true,
          message: "Order status updated successfully"
        };
        result(null, res);
      }
    }
  );
};

Order.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from Orders", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.getAllVirtualOrder = function getAllVirtualOrder(result) {
  sql.query("Select * from Orders where virtual=0", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Orders SET moveit_user_id = ? WHERE orderid = ?",
    [id, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Order.remove = function(id, result) {
  sql.query("DELETE FROM Orders WHERE orderid = ?", [id], function(err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Order.get_all_orders = function get_all_orders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * orderlimit;

  var query =
    "Select * from Orders as od left join User as us on od.userid=us.userid";
  var searchquery =
    "us.phoneno LIKE  '%" +
    req.search +
    "%' OR us.email LIKE  '%" +
    req.search +
    "%' or us.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";
  if (req.virtualkey !== "all") {
    query = query + " where od.ordertype = '" + req.virtualkey + "'";
  }
  //var search= req.search
  if (req.virtualkey !== "all" && req.search) {
    query = query + " and (" + searchquery + ")";
  } else if (req.search) {
    query = query + " where " + searchquery;
  }

  var limitquery =
    query +
    " order by od.orderid desc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;
      sql.query(query, function(err, res2) {
        totalcount = res2.length;
        let resobj = {
          success: true,
          status:true,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};

Order.get_today_vorders = function get_today_vorders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var makeithub_id = req.makeithub_id || 1;
  var startlimit = (page - 1) * orderlimit;

  var query =
    "Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1";
  var searchquery =
    "us.phoneno LIKE  '%" +
    req.search +
    "%' OR us.email LIKE  '%" +
    req.search +
    "%' or us.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";

  if (req.makeithub_id) {
    query = query + " and mk.makeithub_id='" + makeithub_id + "'";
  }

  if (req.search) {
    query = query + " and (" + searchquery + ")";
  }

  var limitquery =
    query +
    " order by od.orderid desc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        if (err) {
          result(err, null);
          return;
        }
        totalcount = res2.length;
        let resobj = {
          success: true,
          status: true,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};

Order.get_all_vorders = function get_all_vorders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var makeithub_id = req.makeithub_id || 0;
  var startlimit = (page - 1) * orderlimit;

  var query =
    "Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where mk.virtualkey = 1";
  var searchquery =
    "us.phoneno LIKE  '%" +
    req.search +
    "%' OR us.email LIKE  '%" +
    req.search +
    "%' or us.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";
  if (req.makeithub_id) {
    query = query + " and mk.makeithub_id='" + makeithub_id + "'";
  }
  //var search= req.search
  if (req.search) {
    query = query + " and (" + searchquery + ")";
  }

  var limitquery =
    query +
    " order by od.orderid desc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        totalcount = res2.length;
        let resobj = {
          success: true,
          status: true,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};

Order.order_assign = function order_assign(req, result) {
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log(assign_time);
  sql.query(
    "Select online_status,pushid_android,pushid_ios From MoveitUser where userid= '" +
      req.moveit_user_id +
      "' ",
    function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        var online_status = res1[0].online_status;
        if (online_status == 1) {
          sql.query(
            "UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",
            [req.moveit_user_id, assign_time, req.orderid],
            async function(err, res2) {
              if (err) {
                result(err, null);
              } else {
                await Notification.orderMoveItPushNotification(
                  req.orderid,
                  PushConstant.pageidMoveit_Order_Assigned,
                  res1[0]
                );
                let resobj = {
                  success: true,
                  status:true,
                  message: "Order Assign Successfully"
                };
                result(null, resobj);
              }
            }
          );
        } else {
          let resobj = {
            success: true,
            status: false,
            message: "Move it user is offline"
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.getUnassignorders = function getUnassignorders(result) {
  sql.query(
    "Select us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0",
    function(err, res) {
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
    }
  );
};

Order.orderviewbymoveituser = function(orderid, result) {
  // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
  sql.query(
    "select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" +
      orderid +
      "'",
    function(err, responce) {
      if (err) {
        result(err,null);
      } else {
        let resobj = {
          success: true,
          status:true,
          res: responce
        };
        result(null, resobj);
      }
    }
  );
};
//////////////
Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
  var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");

  var twentyMinutesLater = moment()
        .add(0, "seconds")
        .add(20, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");

sql.query("Select * from Orders where orderid = ?", [req.orderid], function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      for (let i = 0; i < kitchenqualitylist.length; i++) {
        var qualitylist = new MoveitRatingForMakeit(kitchenqualitylist[i]);
        qualitylist.orderid = req.orderid;
        qualitylist.makeit_userid = req.makeit_userid;
        qualitylist.moveit_userid = req.moveit_userid;

        MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck(
          qualitylist,
          function(err, res2) {
            if (err) result(err, null);
          }
        );
      }

      if (res1[0].moveit_user_id === req.moveit_userid) {
        sql.query(
          "UPDATE Orders SET orderstatus = ? ,moveit_reached_time = ?,moveit_expected_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
          [
            req.orderstatus,
            order_pickup_time,
            twentyMinutesLater,
            req.orderid,
            req.moveit_userid
          ],
          async function(err, res2) {
            if (err) {
              result(err, null);
            } else {
              await Notification.orderEatPushNotification(
                req.orderid,
                null,
                PushConstant.Pageid_eat_order_pickedup
              );
              let resobj = {
                success: true,
                status:true,
                message: "Order Pickedup successfully"
              };
              result(null, resobj);
            }
          }
        );
      } else {
        let resobj = {
          success: true,
          status:false,
          message: "Following order is not assigned to you!"
        };
        result(null, resobj);
      }
    }
  });
};

Order.order_delivery_status_by_moveituser = function(req, result) {

  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res1.length > 0) {
          if (res1[0].payment_status === 1) {
            sql.query(
              "UPDATE Orders SET orderstatus = ?,moveit_actual_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
              [req.orderstatus, order_delivery_time, req.orderid, req.moveit_user_id],
              async function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  let sucobj = true;
                  let orderdeliverystatus = true;
                  let message = "Order Delivery successfully";
                  let resobj = {
                    success: sucobj,
                    message: message,
                    status:true,
                    orderdeliverystatus: orderdeliverystatus
                  };
                  await Notification.orderEatPushNotification(
                    req.orderid,
                    null,
                    PushConstant.Pageid_eat_order_delivered
                  );
                  result(null, resobj);
                }
              }
            );
          } else {
            let sucobj = true;
            let orderdeliverystatus = false;
            let message = "Payment not yet paid!";
            let resobj = {
              success: sucobj,
              status:false,
              message: message,
              orderdeliverystatus: orderdeliverystatus
            };

            result(null, resobj);
          }
        } else {
          let sucobj = true;
          let message = "Please check your moveit_user details!";
          let resobj = {
            success: sucobj,
            message: message,
            status:false
          };

          result(null, resobj);
        }
      }
    }
  );
};

Order.moveit_kitchen_reached_status = function(req, result) {
  var kitchenreachtime = new Date();
  var twentyMinutesLater = new Date();
  twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);

  sql.query("Select * from Orders where orderid = ?", [req.orderid], function(
    err,
    res1
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      var getmoveitid = res1[0].moveit_user_id;

      if (getmoveitid === req.moveit_user_id) {
        sql.query(
          "UPDATE Orders SET orderstatus = ?,moveit_reached_time = ?,moveit_expected_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
          [
            req.orderstatus,
            kitchenreachtime,
            twentyMinutesLater,
            req.orderid,
            req.moveit_user_id
          ],
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              let sucobj = true;
              let message = "kitchen reached successfully";
              let resobj = {
                success: sucobj,
                message: message
              };

              result(null, resobj);
            }
          }
        );
      } else {
        let sucobj = true;
        let message = "Following order is not assigned to you!";
        let resobj = {
          success: sucobj,
          message: message
        };

        result(null, resobj);
      }
    }
  });
};

Order.order_payment_status_by_moveituser = function(req, result) {
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res1);
        if (res1.length > 0) {
          // check the payment status - 1 is paid
          if (res1[0].payment_status === 0) {
            sql.query(
              "UPDATE Orders SET payment_status = ? WHERE orderid = ? and moveit_user_id =?",
              [req.payment_status, req.orderid, req.moveit_user_id],
              function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  let sucobj = true;
                  let message = "Cash received successfully";
                  let resobj = {
                    success: sucobj,
                    message: message
                  };

                  result(null, resobj);
                }
              }
            );
          } else {
            let sucobj = true;
            let message = "Already Payment has been paid!";
            let resobj = {
              success: sucobj,
              message: message
            };

            result(null, resobj);
          }
        } else {
          let sucobj = true;
          let message =
            "Please check your orderid and moveit user id! / order values is null";
          let resobj = {
            success: sucobj,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Order.orderhistorybymoveituserid = async function(moveit_user_id, result) {
  
 // try {
    const rows = await query(
      "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone,ms.userid as makeituserid,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id =" +
        moveit_user_id +
        " and (ors.orderstatus = 6 or ors.orderstatus = 7) order by ors.moveit_actual_delivered_time desc"
    );

    if (rows.length === 0) {
     
      let resobj = {
        success: false,
        status:false,
        result: rows
      };
      result(null, resobj);
    } else {
     
    
    for (let i = 0; i < rows.length; i++) {
      var url =
        "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
        rows[i].orderid +
        "";

      let products = await query(url);

      rows[i].items = products;
    }
        
        let resobj = {
          success: true,
          status:true,
          result: rows
        };

    result(null, resobj);
  }
  // } catch (err) {
  //   var errorCode = 402;

  //   result(null, errorCode);
  // }
};

Order.orderlistbymoveituserid = async function(moveit_user_id, result) {
  const rows = await query(
    "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id where ors.moveit_user_id =" +
      moveit_user_id +
      " and   DATE(ors.ordertime) = CURDATE() order by  ors.order_assigned_time desc"
  );

  if (rows.length > 0) {
    console.log("Fetching No of Store Id", rows.length);
  } else {
    var res = {
      result: "Order is not found!",
      status: false
    };
    result(null, res);
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    var url =
      "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
      rows[i].orderid +
      "";

    let products = await query(url);

    rows[i].items = products;
    rows[i].locality = "Guindy";
  }
  let sucobj = true;
  let resobj = {
    success: sucobj,
    status: true,
    result: rows
  };

  result(null, resobj);
};

Order.orderviewbyadmin = function(req, result) {
  console.log(req);
  // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
  sql.query(
    "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'virtualkey',ms.virtualkey) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid ='" +
      req.id +
      "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        for (let i = 0; i < res.length; i++) {
          if (res[i].userdetail) {
            res[i].userdetail = JSON.parse(res[i].userdetail);
          }

          if (res[i].makeitdetail) {
            res[i].makeitdetail = JSON.parse(res[i].makeitdetail);
          }
          if (res[i].moveitdetail) {
            res[i].moveitdetail = JSON.parse(res[i].moveitdetail);
          }

          if (res[i].items) {
            var items = JSON.parse(res[i].items);
            res[i].items = items.item;
          }
        }

        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Order.orderviewbyeatuser = function(req, result) {
  
  sql.query("select * from Orders where orderid =" + req.orderid + " ",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length === 0) {
          let sucobj = true;
          let message = "Order not found!";
          let resobj = {
            success: sucobj,
            status: false,
            message: message,
            result: res
          };

          result(null, resobj);
        } else {
          // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
          sql.query(
            "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid =" +
              req.orderid +
              " ",
            function(err, res1) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                //for (let i = 0; i < res.length; i++) {
                eta = 15 + 3 * res1[0].distance;
                //15min Food Preparation time , 3min 1 km
                res1[0].eta = Math.round(eta) + " mins";

                if (res1[0].userdetail) {
                  res1[0].userdetail = JSON.parse(res1[0].userdetail);
                }

                if (res1[0].makeitdetail) {
                  res1[0].makeitdetail = JSON.parse(res1[0].makeitdetail);
                }
                if (res1[0].moveitdetail) {
                  res1[0].moveitdetail = JSON.parse(res1[0].moveitdetail);
                }

                if (res1[0].items) {
                  var items = JSON.parse(res1[0].items);
                  res1[0].items = items.item;
                }

                if (res[0].orderstatus >= 3) {
                  
                   // +20 min add with moveit order assign time
                  var deliverytime = moment(res[0].ordertime)
                  .add(0, "seconds")
                  .add(20, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");
                  console.log(deliverytime);
                 
                  res1[0].deliverytime = deliverytime;
                }else{

                  var deliverytime = moment(res[0].ordertime)
                  .add(0, "seconds")
                  .add(20, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");
                  console.log(deliverytime);
                 
                  res1[0].deliverytime = deliverytime;

                }
                
                console.log("res[0].orderstatus:-- ", res1[0].orderstatus);
                res1[0].trackingstatus = Order.orderTrackingDetail(
                  res1[0].orderstatus,
                  res1[0].moveitdetail
                );
                //}

            
                let resobj = {
                  success: true,
                  status: true,
                  result: res1
                };

                result(null, resobj);
              }
            }
          );
        }
      }
    }
  );
};

Order.orderTrackingDetail = function(orderstatus, moveit_detail) {
  var trackingDetail = {};
  var moveit_name = moveit_detail ? moveit_detail.name : "";
  orderstatus = orderstatus ? orderstatus : 0;
  switch (orderstatus) {
    case 0:
      trackingDetail.message1 = "Awaiting your mom’s response";
      trackingDetail.message2 = "Yet to start preparation";
      trackingDetail.message3 = "Delivery partner is awaiting the order";
      break;

    case 1:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Preparing.. With love, Your MOM";
      trackingDetail.message3 = moveit_name?
        "Mr." + moveit_name + " is on his way to pickup":"Delivery partner is awaiting the order";
      break;

    case 2:
    case 3:
    case 4:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Your MOM has packed your food";
      trackingDetail.message3 =moveit_name?
      "Mr." + moveit_name + " is on his way to pickup":"Delivery partner is awaiting the order";
      break;

    case 5:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Your MOM has packed your food";
      trackingDetail.message3 =
        "Mr." + moveit_name + " is on his way to delivery";
      break;
  }
  return trackingDetail;
};

Order.orderlistbyeatuser = async function(req, result) {
  var orderitem = [];

  sql.query("select * from Orders where userid ='" +req.userid +"' and orderstatus = 6",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length === 0) {
          let sucobj = true;
          let message = "Active order not found!";
          let resobj = {
            success: sucobj,
            status: false,
            message: message,
            result: res
          };

          result(null, resobj);
        } else {
          // ,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items
          // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
          //    sql.query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where us.userid ='" + req.userid +"'", function (err, res) {

          // var query =
          //   "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where us.userid ='" +
          //   req.userid +
          //   "' and ors.orderstatus = 6 group by ors.orderid order by ors.orderid desc";
          
         var eat_order_history_query = 'CALL eat_order_history(?)';
         
          console.log(query);
          sql.query(eat_order_history_query,[req.userid], async function(err, res1) {
      //  sql.query(query, async function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {

                 history_list = [];
              //  res1 = Array.prototype.concat.apply([], res1);
               history_list.push(res1[0]);
               history_list = Array.prototype.concat.apply([], history_list);
              //  console.log(history_list.length);
              for (let i = 0; i < history_list.length; i++) {
                if (history_list[i].userdetail) {
                  console.log("res1[0].userdetail");
                  history_list[i].userdetail = JSON.parse(history_list[i].userdetail);
                }

                if (history_list[i].makeitdetail) {
                  history_list[i].makeitdetail = JSON.parse(history_list[i].makeitdetail);
                }

                if (history_list[i].moveitdetail) {
                  history_list[i].moveitdetail = JSON.parse(history_list[i].moveitdetail);
                }

                if (history_list[i].items) {
                  var items = JSON.parse(history_list[i].items);
                  history_list[i].items = items;
                }
              }

              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: true,
                result: history_list
              };

              result(null, resobj);
            }
          });
        }
      }
    }
  );
};

Order.eatcreateOrder = async function eatcreateOrder(
  newOrder,
  orderItems,
  result
) {
  const productquantity = [];

  for (let i = 0; i < orderItems.length; i++) {
    sql.query(
      "Select productid,quantity,product_name From Product where productid = '" +
        orderItems[i].productid +
        "' and quantity > '" +
        orderItems[i].quantity +
        "'",
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (res.length <= 0) {
            orderItems[i].availablity = false;
            let sucobj = true;
            let mesobj =
              "Productid" +
              " " +
              orderItems[i].productid +
              " quantity is not available";
            let resobj = {
              success: sucobj,
              message: mesobj,
              orderItems: orderItems
            };
            result(null, resobj);
          } else {
            orderItems[i].availablity = true;
            orderItems[i].productquantity = productquantity.push(res);

            console.log(productquantity.length);
            if (productquantity.length >= orderItems.length) {
              if (newOrder.payment_type === 0) {
                ordercreatecashondelivery();
              } else if (newOrder.payment_type === 1) {
                ordercreateonline();
              }
            }
          }
        }
      }
    );
  }

  function ordercreatecashondelivery() {
    sql.query("INSERT INTO Orders set ?", newOrder, function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        var orderid = res1.insertId;

        for (var i = 0; i < orderItems.length; i++) {
          console.log("order items");
          var orderitem = new Orderitem(orderItems[i]);
          orderitem.orderid = orderid;

          Orderitem.createOrderitems(orderitem, function(
            err,
            orderitemresponce
          ) {
            if (err) result.send(err);
          });
        }

        let sucobj = true;
        let mesobj = "Order Created successfully";
        let resobj = {
          success: sucobj,
          status: true,
          message: mesobj,
          orderid: orderid
        };
        result(null, resobj);
      }
    });
  }

  function ordercreateonline() {
    sql.query("INSERT INTO Orders set ?", newOrder, function(err, res1) {
      if (err) {
        console.log("error: ", err);
        res1(null, err);
      } else {
        var orderid = res1.insertId;

        for (var i = 0; i < orderItems.length; i++) {
          var orderitemlock = new Orderlock(orderItems[i]);
          orderitemlock.orderid = orderid;

          var orderitem = new Orderitem(orderItems[i]);
          orderitem.orderid = orderid;

          Orderitem.createOrderitems(orderitem, function(
            err,
            orderitemresponce
          ) {
            if (err) result.send(err);
          });

          Orderlock.lockOrderitems(orderitemlock, function(
            err,
            orderlockresponce
          ) {
            if (err) result.send(err);
          });
        }

        let sucobj = true;
        let resobj = {
          success: sucobj,
          orderid: orderid
        };
        result(null, resobj);
      }
    });
  }
};

Order.live_order_list_byeatuserid = async function live_order_list_byeatuserid(req,result) {

  const orderdetails = await query("select ors.*,mk.brandname from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.userid ='" +req.userid +"' and ors.orderstatus = 6  and ors.payment_status = 1 order by ors.orderid desc limit 1");

  console.log(orderdetails);
 
  if (orderdetails.length !==0) {
  //  for (let i = 0; i < orderdetails.length; i++) {
    var today = moment();
   
    var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
   
    var diffMs  = (today - moveit_actual_delivered_time);
    var diffDays = Math.floor(diffMs / 86400000); 
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
   
    if (diffDays) {
      console.log("days"+diffDays);
      orderdetails[0].showrating = true;
    }else if(diffHrs){
      console.log("diffHrs"+diffHrs);
      orderdetails[0].showrating = true;
    }else if(diffMins > 30){
      
      console.log("diffHrs"+diffMins);
      orderdetails[0].showrating = true;
    }else{
      orderdetails[0].showrating = false;
      console.log("false");
    }
   
      const orderratingdetails = await query("select * from Order_rating where orderid ='" +orderdetails[0].orderid +"'");
      orderdetails[0].rating = true;

      if (orderratingdetails.length === 0) {
        orderdetails[0].rating = false;
    //  }
    }
  }
  sql.query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2 order by orderid desc limit 1",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length === 0) {
          let sucobj = true;
          let message = "Active order not found!";
          let resobj = {
            success: sucobj,
            status: false,
            message: message,
            orderdetails: orderdetails
            //result: res
          };
          result(null, resobj);
        } else {
          if (res[0].payment_type === "0") {

            var liveorderquery ="Select distinct ors.orderid,ors.ordertime,ors.order_assigned_time,ors.orderstatus,ors.price,ors.userid,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid =" +req.userid +" and ors.orderstatus < 6  and payment_status !=2 ";
           
            console.log(liveorderquery);
            sql.query(liveorderquery, function(err, res1) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {

                if (res1[0].orderstatus >= 3) {
                  
                  // +20 min add with moveit order assign time
                 var deliverytime = moment(res[0].ordertime)
                 .add(0, "seconds")
                 .add(20, "minutes")
                 .format("YYYY-MM-DD HH:mm:ss");
                 console.log(deliverytime);
                
                 res1[0].deliverytime = deliverytime;
               }else{

                 var deliverytime = moment(res[0].ordertime)
                 .add(0, "seconds")
                 .add(20, "minutes")
                 .format("YYYY-MM-DD HH:mm:ss");
                 console.log(deliverytime);
                
                 res1[0].deliverytime = deliverytime;

               }

                for (let i = 0; i < res1.length; i++) {
             
                  res1[i].distance = res1[i].distance.toFixed(2);
                  //15min Food Preparation time , 3min 1 km
                  eta = 15 + (3 * res1[i].distance);

                  res1[i].eta = Math.round(eta) + " mins";

                  if (res1[i].items) {
                    var items = JSON.parse(res1[i].items);
                    res1[i].items = items.item;
                  }
                }

              
             
                let resobj = {
                  success: true,
                  status: true,
                  orderdetails: orderdetails,
                  result: res1
                };

                result(null, resobj);
              }
            });
          } else if (res[0].payment_type === "1" && res[0].payment_status === 1) {

            liveorderquery ="Select ors.orderid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";
         
            sql.query(liveorderquery, function(err, res1) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {

                if (res1[0].orderstatus >= 3) {
                  
                  // +20 min add with moveit order assign time
                 var deliverytime = moment(res[0].ordertime)
                 .add(0, "seconds")
                 .add(20, "minutes")
                 .format("YYYY-MM-DD HH:mm:ss");
                 console.log(deliverytime);
                
                 res1[0].deliverytime = deliverytime;
               }else{

                 var deliverytime = moment(res[0].ordertime)
                 .add(0, "seconds")
                 .add(20, "minutes")
                 .format("YYYY-MM-DD HH:mm:ss");
                 console.log(deliverytime);
                
                 res1[0].deliverytime = deliverytime;

               }

                for (let i = 0; i < res1.length; i++) {
                  // var deliverytime = new Date(res1[i].ordertime);

                  // // d.setHours(d.getHours() + 5);
                  // deliverytime.setMinutes(deliverytime.getMinutes() + 15);

                  // res1[i].deliverytime = deliverytime;

                  res1[i].distance = res1[i].distance.toFixed(2);
                  //15min Food Preparation time , 3min 1 km
                  eta = 15 + 3 * res1[i].distance;

                  res1[i].eta = Math.round(eta) + " mins";

                  if (res1[i].items) {
                    var items = JSON.parse(res1[i].items);
                    res1[i].items = items.item;
                  }
                }

                let sucobj = true;
                let resobj = {
                  success: sucobj,
                  status: true,
                  orderdetails: orderdetails,
                  result: res1
                };

                result(null, resobj);
              }
            });
          } else {
            let sucobj = true;
            let message = "Active order not found!";
            let resobj = {
              success: sucobj,
              status: false,
              message: message,
              orderdetails: orderdetails
              //result: res
            };

            result(null, resobj);
          }
        }
      }
    }
  );
};

Order.create_customerid_by_razorpay = async function create_customerid_by_razorpay(
  userid
) {
  const userinfo = await query("Select * from User where userid = '" + userid + "'");
  var customerid = userinfo[0].razer_customerid;
  console.log("customerid-->",customerid);
  if(customerid) return customerid;

  var name = userinfo[0].name;
  var email = userinfo[0].email;
  var contact = userinfo[0].phoneno;
  var notes = "eatuser";
  var fail_existing="1";
  var cuId = false;


  return await instance.customers
    .create({ name, email, contact, notes,fail_existing})
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
            return false;
          }
        }
      );
      return cuId;
    })
    .catch(error => {
      console.log("error: ", error);
      return false;
    });
};

Order.create_refund = function create_refund(refundDetail) {
  var refund = new RefundOnline(refundDetail);
  RefundOnline.createRefund(refund, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.eat_order_cancel = async function eat_order_cancel(req, result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  if (orderdetails[0].orderstatus < 5) {
    sql.query("UPDATE Orders SET orderstatus = 7,cancel_by = 1,cancel_reason= '" +req.cancel_reason +"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };


              if (orderdetails[0].payment_type === "0") {
                      var rc = new RefundCoupon(req);
                      RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
                        if (err) {
                          result(err, null);
                        } 
                      });
                    } else if (orderdetails[0].payment_type === "1" && orderdetails[0].payment_status === 1) {

                      await RefundOnline.createRefund(refundDetail);
                    }

                    var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
                    
                    console.log(orderitemdetails);
                    for (let i = 0; i < orderitemdetails.length; i++) {
                      var productquantityadd =
                        "update Product set quantity = quantity+" +
                        orderitemdetails[i].quantity +
                        " where productid =" +
                        orderitemdetails[i].productid +
                        "";
        
                      sql.query(productquantityadd, function(err, res2) {
                        if (err) {
                          console.log("error: ", err);
                          result(null, err);
                        } else {
                        }
                      });
                    }

          await Notification.orderMakeItPushNotification(
            req.orderid,
            null,
            PushConstant.pageidMakeit_Order_Cancel
          );

          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            console.log("EAT  Cancel-->"+orderdetails[0].moveit_user_id)
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }
          let response = {
            success: true,
            status: true,
            message: "Your order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  } else if (orderdetails[0].orderstatus === 5) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order almost reached to you.So can't be cancel"
    };
    result(null, response);
  } else if (orderdetails[0].orderstatus === 6) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order already deliverd."
    };
    result(null, response);
  } else if (orderdetails[0].orderstatus === 7) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order already canceled."
    };
    result(null, response);
  }
};

Order.makeit_order_cancel = async function makeit_order_cancel(req, result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  if (orderdetails[0].orderstatus === 7 ) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  }else if(orderdetails[0].orderstatus === 5){
      let response = {
        success: true,
        status: false,
        message: "Sorry! This order has been pickeped."
      };
      result(null, response);

  } else {
    sql.query("UPDATE Orders SET orderstatus = 7,cancel_by = 2 WHERE orderid ='" +req.orderid +"'",
    
    async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };
          

          var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
                    
        
          for (let i = 0; i < orderitemdetails.length; i++) {
            var productquantityadd =
              "update Product set quantity = quantity+" +
              orderitemdetails[i].quantity +
              " where productid =" +
              orderitemdetails[i].productid +
              "";

            sql.query(productquantityadd, function(err, res2) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
              }
            });
          }


          if (orderdetails[0].payment_type === "1" && orderdetails[0].payment_status === 1)
            await Order.create_refund(refundDetail);
             await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            console.log("Makeit  Cancel-->"+orderdetails[0].moveit_user_id)
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }
          let response = {
            success: true,
            status: true,
            message: "Sorry order is not taken kitchen!"
          };
          result(null, response);
        }
      }
    );
  }
};

Order.makeit_order_accept = async function makeit_order_accept(req, result) {
  const orderdetails = await query(
    "select * from Orders where orderid ='" + req.orderid + "'"
  );

  // d.setHours(d.getHours() + 5);
  if (orderdetails.length !== 0) {
    console.log(orderdetails[0].orderstatus);
    if (orderdetails[0].orderstatus < 1) {
      var orderaccepttime = moment()
        .add(0, "seconds")
        .add(15, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");
      // deliverytime.setMinutes(transaction_time.getMinutes() + 15);
      console.log(orderaccepttime);
      updatequery ="UPDATE Orders SET orderstatus = 1 ,makeit_expected_preparing_time= '" + orderaccepttime +"' WHERE orderid ='" +req.orderid +"'";
      console.log(updatequery);
      sql.query(updatequery, async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_accept
          );
          let response = {
            success: true,
            status: true,
            message: "Order accepted successfully."
          };
          result(null, response);
        }
      });
    } else if (orderdetails[0].orderstatus == 1) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order already received"
      };
      result(null, response);
    } else if (orderdetails[0].orderstatus == 7) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order was cancelled"
      };
      result(null, response);
    } else {
      let response = {
        success: true,
        status: false,
        message: "order id not found Please check"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "Sorry your order already received"
    };
    result(null, response);
  }
};

Order.order_missing_by_makeit = async function order_missing_by_makeit(req, result) {
  const orderdetails = await query(
    "select * from Orders where orderid ='" + req.orderid + "'"
  );
  if (orderdetails[0].orderstatus === 8) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  } else {
    sql.query("UPDATE Orders SET orderstatus = 8,cancel_by = 2 WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid :orderdetails[0].userid,
            payment_id:orderdetails[0].transactionid,
          };
          if (
            orderdetails[0].payment_type === "1" &&
            orderdetails[0].payment_status === 1
          )
          await Order.create_refund(refundDetail);
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          let response = {
            success: true,
            status: true,
            message: "Sorry your order accept time is missing.so this order is auto cancel"
          };
          result(null, response);
        }
      }
    );
  }
};
Order.admin_order_cancel = async function admin_order_cancel(req, result) {
  const orderdetails = await query(
    "select * from Orders where orderid ='" + req.orderid + "'"
  );
  if (orderdetails[0].orderstatus === 7) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  } else {
    sql.query(
      "UPDATE Orders SET orderstatus = 7,cancel_by = 2 WHERE orderid ='" +
        req.orderid +
        "'",
      async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };
          if (
            orderdetails[0].payment_type === "1" &&
            orderdetails[0].payment_status === 1
          )
            await Order.create_refund(refundDetail);
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          let response = {
            success: true,
            status: true,
            message: "order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  }
};
Order.eat_order_missing_byuserid = async function eat_order_missing_byuserid(req,result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
  console.log(orderdetails);
  if (orderdetails) {
    if (orderdetails[0].orderstatus === 6) {
      sql.query("UPDATE Orders SET item_missing = 1,item_missing_reason='" +req.item_missing_reason +"' WHERE orderid ='" +req.orderid +"'",
          async function(err, res1) {
          if (err) {
            result(err, null);
          } else {
            //console.log(orderdetails[0].payment_type);
            if (orderdetails[0].payment_type === "0") {
              var rc = new RefundCoupon(req);
              RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
                if (err) {
                  result(err, null);
                } else {
                  // console.log(res3.status);
                  if (res2.status != true) {
                    result(null, res2);
                  } else {
                    let response = {
                      success: true,
                      status: true,
                      message: "Refunded created successfully."
                    };
                    result(null, response);
                  }
                }
              });
            } else if (orderdetails[0].payment_type === "1" && orderdetails[0].payment_status === 1) {
              // var rc =new RefundOnline(req);
              var refundDetail = {
                orderid: req.orderid,
                original_amt: orderdetails[0].price,
                active_status: 1,
                userid: orderdetails[0].userid,
                payment_id: orderdetails[0].transactionid
              };
              await Order.create_refund(refundDetail);
                let response = {
                  success: true,
                  status: true,
                  message: "Refunded created successfully."
                };
                result(null, response);
            }
          }
        }
      );
    } else if(orderdetails[0].orderstatus === 7){
      let response = {
        success: true,
        status: false,
        message: "Following order canceled"
      };
      result(null, response);
    }else {
      let response = {
        success: true,
        status: false,
        message: "Following order not yet to delivered"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "Following order is not available"
    };
    result(null, response);
  }
};
Order.get_order_waiting_list = function get_order_waiting_list(req, result) {

  console.log(req);

  var waitinglistquery = "SELECT ors.orderid,ors.ordertime,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail from Orders as ors left join MakeitUser ms on ors.makeit_user_id = ms.userid WHERE  ors.orderstatus=0 and ors.lock_status = 0  and ors.created_at < (DATE_SUB(CURDATE(), interval 6 minute)) group by ors.orderid order by ors.orderid  desc";

  sql.query(waitinglistquery, function(err,res1) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
      }
      let resobj = {
        success: true,
        status:true,
        result: res1
      };

      result(null, resobj);
    }
    
  });
};

module.exports = Order;
