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
var request = require('request');
var OrderDeliveryTime = require("../../model/common/orderdeliverytimeModel");
var MoveitReassignedOrders = require("../../model/common/moveitReassignedOrdersModel");
var MoveitStatus = require("../../model/moveit/moveitStatusModel");
var createForcedeliverylogs = require("../../model/common/forcedeliverylogsModel");
var MoveitFireBase =require("../../push/Moveit_SendNotification");
var Ordersqueue = require("../../model/common/ordersqueueModel");
// var instance = new Razorpay({
//   key_id: "rzp_test_3cduMl5T89iR9G",
//   key_secret: "BSdpKV1M07sH9cucL5uzVnol"
// });

// var instance = new Razorpay({
//   key_id: 'rzp_live_BLJVf00DRLWexs',
//   key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
// })

var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
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
  this.original_price = order.original_price || 0;
  this.refund_amount = order.refund_amount || 0;
  this.discount_amount = order.discount_amount || 0;
  this.address_title = order.address_title;
  this.locality_name = order.locality_name;
  this.cancel_reason = order.cancel_reason;
  this.makeit_earnings = order.makeit_earnings;
  this.moveit_accept_time = order.moveit_accept_time;
  this.moveit_status = order.moveit_status || 0;
  this.cancel_charge = order.cancel_charge;
  this.rating_skip = order.rating_skip;
  this.landmark = order.landmark;
  this.flatno = order.flatno;
  this.app_type = order.app_type || 3;
  this.cancel_status = order.cancel_status ||0;
};



Order.createOrder = async function createOrder(req, orderitems, result) {
  try {
    const res = await query( "select count(*) as count from Orders where orderstatus < 6 and lock_status = 0 and userid= '" +req.userid +"'");
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
      errorCode: 402,
      error:error
    };
    console.log("error--->",error);
    result(null, resobj);
  }
};

Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(req,orderitems,result) {

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
 // var currenthour = 23
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var dinnerend = constant.dinnerend;

  const delivery_charge = constant.deliverycharge;
  // console.log(currenthour);
  // console.log(dinnerend);
  if (currenthour >= breatfastcycle && currenthour <= dinnerend) {
     
    const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
 

    if (res.length === 0 ) {

    //get address 
      const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
    //console.log("address_data-->",address_data);
    if(address_data.length === 0) {
      let resobj = {
                success: true,
                status: false,
                message: "Sorry your selected address wrong.Please select correct address."
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
                  req.makeit_earnings = amountdata.makeit_earnings;
               
                  req.cus_address = address_data[0].address;
                  req.locality = address_data[0].locality;
                  req.cus_lat = address_data[0].lat;
                  req.cus_lon = address_data[0].lon;
                  req.address_title = address_data[0].address_title;
                  req.locality_name = address_data[0].locality;

                  console.log(address_data[0].flatno);
                  console.log(address_data[0].landmark);
                  req.flatno = address_data[0].flatno;
                  req.landmark = address_data[0].landmark;
                  req.coupon = req.cid
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
   }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
  let resobj = {
    success: true,
    status: false,
    message: "Please complete your payment for yor order",
    result : res
  };
  result(null, resobj);
}else {
   
    let resobj = {
      success: true,
      status: false,
      message: "Already you have one order, So please try once delivered exiting order"
      
    
    };
    result(null, resobj);
  }
}else{

  
  let resobj = {
    success: true,
    status: false,
    message: "Sorry Currently we are not receiving orders!"
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
  req.lock_status = 1;
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
  console.log(new_Order);
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

  var orderdetails = await query("select * from Orders where orderid ='"+order_place.orderid+"'");

  if (orderdetails.length!==0) {
    
    if (orderdetails[0].payment_status==2) {   
      let resobj = {
        success: true,
        message: "Sorry Order is already payment failed!",
        status: false,
        orderid: order_place.orderid
      };
      result(null, resobj);
    }else  if (orderdetails[0].payment_status==1) {
      
      let resobj = {
        success: true,
        message: "Sorry Order is already payment paid",
        status: false,
        orderid: order_place.orderid
      };
      result(null, resobj);
    }else{

    
  
  var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var transaction_status= order_place.payment_status === 1? 'success':'failed';
  var orderUpdateQuery =
  "update Orders set payment_status = '" +
  order_place.payment_status +
  "', lock_status = 0,transactionid='" +
  order_place.transactionid +
  "',transaction_status='"+transaction_status+"', transaction_time= '" +
  transaction_time +
  "' WHERE orderid = '" +
  order_place.orderid +
  "' ";

  //////////= Razorpay caption =////////// 
if(order_place.payment_status === 1){
  const getprice = await query("select price from Orders where orderid ='"+order_place.orderid+"'");
  if (getprice.err) {
 
  }else{
    var paymentid  = order_place.transactionid;
    var amount     = getprice[0].price*100;
    instance.payments.capture(paymentid, parseInt(amount))
    .then((data)=>{
      captionupdate = "update Orders set captured_status=1 where transactionid='"+order_place.transactionid+"'";
      sql.query(captionupdate, async function(err, captionresult) {
        if (err) {
          result(err, null);
        }else{
          console.log(captionresult);
        }
      });
    }).catch((err)=>{
      console.log(err);      
    });
  }
}
///////////////////////////////////

  sql.query(orderUpdateQuery, async function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      if (order_place.payment_status === 1) {
       
        // const orderdetails = await query("select * from Orders where orderid ='" +order_place.orderid +"'");
        // if (orderdetails.err) {
        //   let resobj = {
        //     success: true,
        //     status: false,
        //     result: orderdetails.err
        //   };
        //   result(null, resobj);
        // }else{

        //   if (orderdetails[0].coupon || order_place.cid) {
            
        //        var new_createCouponUsed = new CouponUsed(order_place); 
        //       new_createCouponUsed.after_discount_cost = orderdetails[0].price
        //       new_createCouponUsed.order_cost = orderdetails[0].original_price
        //       new_createCouponUsed.userid = orderdetails[0].userid
          
        //       CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
        //         if (err) {
        //           result(err, null);
        //           return;
        //         }
        //       });
        //   } 

        //   if (order_place.refund_balance !== 0 || order_place.rcid || orderdetails[0].refund_amount) {
        //     var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(
        //       order_place.rcid,
        //       order_place.refund_balance,
        //       order_place.orderid
        //     );
        //   }

        // }

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
         
   
        if (order_place.refund_balance !== 0 || order_place.rcid ) {
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
      }else if (order_place.payment_status === 2) {
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
}
}else{
  let resobj = {
    success: true,
    message: "Sorry Order is not found!",
    status: false
  };
  result(null, resobj);
}
};

Order.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userid) {
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

Order.updateOrderStatus =async function updateOrderStatus(req, result) {

var orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid ='" + req.orderid + "'");

if (orderdetails[0].orderstatus < 5) {
  var updatequery = "Update Orders set orderstatus = ? where orderid = ?"
  var values=[req.orderstatus, req.orderid];
  if (req.orderstatus === PushConstant.masteridOrder_Accept){
    var makeit_accept_time = moment().format("YYYY-MM-DD HH:mm:ss");
      var makeit_expected_preparing_time = moment()
      .add(0, "seconds")
      .add(15, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
  values=[req.orderstatus, makeit_expected_preparing_time,makeit_accept_time,req.orderid];
  updatequery = "Update Orders set orderstatus = ?,makeit_expected_preparing_time= ?,makeit_accept_time=?,makeit_status=1 where orderid = ? "
  }else if (req.orderstatus === PushConstant.masteridOrder_Prepared){
    var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
    values=[req.orderstatus, transaction_time, req.orderid];
    updatequery = "Update Orders set orderstatus = ?,makeit_actual_preparing_time= ? where orderid = ? "
  }

  sql.query(updatequery,values,async function(err, res) {
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

        req.orglat = orderdetails[0].makeit_lat;
        req.orglon = orderdetails[0].makeit_lon;
        req.deslat = orderdetails[0].cus_lat;
        req.deslon = orderdetails[0].cus_lon;

        Order.eat_order_distance_calculation(req ,async function(err,res3) {
          if (err) {
            result(err, null);
          } else {
            if (res3.status != true) {
              result(null, res3);
            } else {
  
              
              var routes = res3.result;
              var caldistance = routes.routes;
              var deliverytimedata = caldistance[0].legs;
             
              req.distance = parseInt(deliverytimedata[0].distance.text);
               req.duration = parseInt(deliverytimedata[0].duration.text);
               req.duration = req.duration + constant.orderbuffertime;
               req.deliverytime  = moment()
               .add(0, "seconds")
               .add(req.duration, "minutes")
               .format("YYYY-MM-DD HH:mm:ss");

               await Order.insert_delivery_time(req);

              let response = {
                success: true,
                status: true,
                message: "Order accepted successfully.",
             //   result :deliverytimedata 
              };
              result(null, response);
            }
          }
        });
      }
    }
  );
}else if (orderdetails[0].orderstatus == 5){

  let response = {
    success: true,
    status: true,
    message: "Order already pickedup",
 //   result :deliverytimedata 
  };
  result(null, response);
}else if (orderdetails[0].orderstatus == 6){

  let response = {
    success: true,
    status: true,
    message: "Order already delivered",
 //   result :deliverytimedata 
  };
  result(null, response);
}else{

  let response = {
    success: true,
    status: true,
    message: "Order already Canceled",
 //   result :deliverytimedata 
  };
  result(null, response);
}
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
  "Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id where (od.payment_type=0 or (od.payment_type=1 and od.payment_status<2))";
 // var query =
    //"Select * from Orders as od left join User as us on od.userid=us.userid where (od.payment_type=0 or (od.payment_type=1 and od.payment_status>0) )and orderstatus < 9";
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
    query = query + " and od.ordertype = '" + req.virtualkey + "'";
  }
  //var search= req.search
  if (req.virtualkey !== "all" && req.search) {
    query = query + " and (" + searchquery + ")";
  } else if (req.search) {
    query = query + " and " + searchquery;
  }

  var limitquery =query +" order by od.orderid desc limit " +startlimit +"," +orderlimit +" ";

 
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

// Order.get_today_vorders = function get_today_vorders(req, result) {
//   var orderlimit = 20;
//   var page = req.page || 1;
//   var makeithub_id = req.makeithub_id || 1;
//   var startlimit = (page - 1) * orderlimit;
//   var orderstatus =req.orderstatus||0
//   var query ="Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = "+orderstatus;

//   var searchquery =
//     "us.phoneno LIKE  '%" +
//     req.search +
//     "%' OR us.email LIKE  '%" +
//     req.search +
//     "%' or us.name LIKE  '%" +
//     req.search +
//     "%'  or od.orderid LIKE  '%" +
//     req.search +
//     "%'";

//   if (req.makeithub_id) {
//     query = query + " and mk.makeithub_id='" + makeithub_id + "'";
//   }

//   if (req.search) {
//     query = query + " and (" + searchquery + ")";
//   }

//   var limitquery =
//     query +
//     " order by od.orderid asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";

//     if(req.orderstatus===1){
//     limitquery = query +" order by od.makeit_expected_preparing_time asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";
//     }
//     if(req.orderstatus===3){
//     limitquery = query +" order by od.makeit_actual_preparing_time asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";
//     }
    
    

//   sql.query(limitquery, function(err, res1) {
//     if (err) {
//       result(err, null);
//     } else {
//       var totalcount = 0;

//       sql.query(query, function(err, res2) {
//         if (err) {
//           result(err, null);
//           return;
//         }
//         totalcount = res2.length;
//         let resobj = {
//           success: true,
//           status: true,
//           totalorder: totalcount,
//           result: res1
//         };
//         result(null, resobj);
//       });
//     }
//   });
// };

Order.get_today_vorders = function get_today_vorders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var makeithub_id = req.makeithub_id || 1;
  var startlimit = (page - 1) * orderlimit;
  var orderstatus =req.orderstatus||0

  //var query ="Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.lock_status=0 and od.orderstatus = "+orderstatus;
  var query =
    "Select od.*,mk.name as makeit_name,mk.brandname as makeit_brandname,IF(((od.created_at+ INTERVAL 10 MINUTE) < now() && od.orderstatus=0),'1','0') as isAlert,JSON_OBJECT('productitem', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items"+ 
    " from Orders as od"+ 
    " left join MakeitUser as mk on mk.userid=od.makeit_user_id"+
    " left join OrderItem ci ON ci.orderid = od.orderid"+ 
    " left join Product pt on pt.productid = ci.productid"+
    " where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = "+orderstatus;
    
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
    " group by od.orderid order by od.orderid asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

    if(req.orderstatus===1){
    limitquery = query +" group by od.orderid order by od.makeit_expected_preparing_time asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";
    }
    if(req.orderstatus===3){
    limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";
    }

    if(req.orderstatus===3){
      limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
      startlimit +
      "," +
      orderlimit +
      " ";
      }

      if(req.orderstatus===4){
        limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
        startlimit +
        "," +
        orderlimit +
        " ";
        }


  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;
      var isAlert =false;
      var isAlertCount =0;
      sql.query(query, function(err, res2) {
        if (err) {
          result(err, null);
          return;
        }
        totalcount = res2.length;
        for(var i=0;i<res1.length;i++){
          if(res1[i].isAlert==='1') {isAlert=true; isAlertCount+=1;}
          res1[i].items= JSON.parse(res1[i].items);
        }
        let resobj = {
          success: true,
          status: true,
          isAlertCount:isAlertCount,
          isAlert:isAlert,
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
    "Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) ";
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
  if(req.search) {
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

  sql.query("Select online_status,pushid_android,pushid_ios,login_status From MoveitUser where userid= '" +req.moveit_user_id +"' ",function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        var online_status = res1[0].online_status;
        if (res1[0].login_status == 1) {
                 
        if (online_status == 1) {
          sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[req.moveit_user_id, assign_time, req.orderid],async function(err, res2) {
              if (err) {
                result(err, null);
              } else {

                await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned,res1[0]);

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
      }else if(res1[0].login_status == 2){
        let resobj = {
          success: true,
          status: false,
          message: "Please login"
      };
    
      result(null, resobj);
      }else if(res1[0].login_status == 3){
        let resobj = {
          success: true,
          status: false,
          message: "Please contact Administrator"
      };
    
      result(null, resobj);
      }
      }
    }
  );
};

Order.getUnassignorders =async function getUnassignorders(req,result) {
//req.id == 1 getUnassignorders
//req.id == 2 unacceptorders
//req.id == 3 delivery orders
  if (req.id == 1 ) {
    
    var res = await query("Select mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0");
    if (res.err) {
      result(err, null);
    } 
    // sql.query(
    //   "Select us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0",
    //   function(err, res) {
    //     if (err) {
    //       result(err, null);
    //     } else {
    //       let resobj = {
    //         success: true,
    //         status:true,
    //         result: res
    //       };
    //       result(null, resobj);
    //     }
    //   }
    // );Select * from Orders where DATE(created_at) = CURDATE() and moveit_user_id !=0 and (moveit_status IS NULL OR moveit_status = '') and orderstatus < 6 order by orderid ASC
  }else if(req.id == 2){
    var res = await query("Select mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and ors.moveit_user_id !=0 and (ors.moveit_status IS NULL OR ors.moveit_status = '') and ors.orderstatus < 5 order by ors.orderid ASC");
    if (res.err) {
          result(err, null);
        } 
  }else if(req.id == 3){
    var res = await query("Select mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and ors.moveit_user_id !=0 and ors.moveit_status = 1  and ors.orderstatus < 6 order by ors.orderid ASC");
  if (res.err) {
    result(err, null);
  } 
  }else if(req.id == 4){
    var res = await query("Select mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and (ors.created_at+ INTERVAL 45 MINUTE) < now() and ors.payment_status<2 and ors.orderstatus < 6 order by ors.orderid ASC");
    if (res.err) {
      result(err, null);
    } 
  }else{
    var res = await query("Select mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0");
  }
 
  let resobj = {
            success:true,
            status:true,
            result: res
          };
          result(null, resobj);
 
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



Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
  var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var twentyMinutesLater = moment().add(0, "seconds").add(constant.foodpreparationtime, "minutes").format("YYYY-MM-DD HH:mm:ss");

sql.query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {
        
      
      if (res1[0].orderstatus == 7) {
        let resobj = {
          success: true,
          status:false,
          message: "Sorry! This order already canceled."
        };
        result(null, resobj);
       // return;
      }else if (res1[0].orderstatus < 3 ) {
        console.log(res1[0].orderstatus);
        let resobj = {
          success: true,
          status:false,
          message: "Please wait food not yet prepared"
        };
        result(null, resobj);
      //  return;
      }else{
        console.log(res1[0].orderstatus);
      if (res1[0].moveit_user_id == req.moveit_userid) {

        req.moveitid = req.moveit_userid;
        req.status = 3 // order pickup by moveit
        await Order.insert_order_status(req);

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

        sql.query(
          "UPDATE Orders SET orderstatus = ? ,moveit_pickup_time = ?,moveit_expected_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
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

              req.orglat = res1[0].makeit_lat;
              req.orglon = res1[0].makeit_lon;
              req.deslat = res1[0].cus_lat;
              req.deslon = res1[0].cus_lon;
    
              Order.eat_order_distance_calculation(req ,async function(err,res3) {
                if (err) {
                  result(err, null);
                } else {
                  if (res3.status != true) {
                    result(null, res3);
                  } else {
        
                    
                    var routes = res3.result;
                    var caldistance = routes.routes;
                    var deliverytimedata = caldistance[0].legs;
                   
                    req.distance = parseInt(deliverytimedata[0].distance.text);
                     req.duration = parseInt(deliverytimedata[0].duration.text);
                     req.duration = req.duration + constant.orderbuffertime;
                     req.deliverytime  = moment()
                     .add(0, "seconds")
                     .add(req.duration, "minutes")
                     .format("YYYY-MM-DD HH:mm:ss");
    
                     await Order.insert_delivery_time(req);
                                  
                    let response = {
                      success: true,
                      status: true,
                      message: "Order Pickedup successfully.",
                   
                    };
                    result(null, response);
                  }
                }
              });
            
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
    }else{
      let response = {
        success: true,
        status: false,
        message: "Order not found.",
     
      };
      result(null, response);
    }
    }
});
};

Order.order_delivery_status_by_moveituser = function(req, result) {
  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length !== 0) {

          if (res1[0].orderstatus == 6) {
            let resobj = {
              success: true,
              message: "Sorry!  order was already deliverd.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus == 7) {
            let resobj = {
              success: true,
              message: "Sorry!  order already canceled.",
              status:false
            };
            result(null, resobj);
          }else{

          if (res1[0].payment_status == 1) {

            req.moveitid = req.moveit_user_id;
            req.status = 7
            await Order.insert_order_status(req); 


            sql.query(
              "UPDATE Orders SET orderstatus = ?,moveit_actual_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
              [req.orderstatus, order_delivery_time, req.orderid, req.moveit_user_id],
              async function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    message: "Order Delivery successfully",
                    status:true,
                    orderdeliverystatus: true
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
            let resobj = {
              success: true,
              status:false,
              message: "Payment not yet paid!",
              orderdeliverystatus: false
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            message: "Sorry! no order found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.moveit_kitchen_reached_status = function(req, result) {
  var kitchenreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
  var twentyMinutesLater = new Date();
  twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);

  sql.query("Select * from Orders where orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      var getmoveitid = res1[0].moveit_user_id;
      if (getmoveitid == req.moveit_user_id) {
        req.moveitid = req.moveit_user_id
        req.status = 2
        await Order.insert_order_status(req);

        sql.query(
          "UPDATE Orders SET moveit_reached_time = ? WHERE orderid = ? and moveit_user_id =?",
          [           
            kitchenreachtime,
            req.orderid,
            req.moveit_user_id
          ],
          function(err, res) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status:true,
                message: "kitchen reached successfully"
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

Order.order_payment_status_by_moveituser = function(req, result) {
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length > 0) {
          // check the payment status - 1 is paid
          console.log(res1[0].payment_status);
          if (res1[0].payment_status == 0) {

            req.moveitid = req.moveit_user_id;
            req.status = 6
            await Order.insert_order_status(req); 

            sql.query(
              "UPDATE Orders SET payment_status = ? WHERE orderid = ? and moveit_user_id =?",
              [req.payment_status, req.orderid, req.moveit_user_id],
              function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    status:true,
                    message: "Cash received successfully"
                  };
                  result(null, resobj);
                }
              }
            );
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Already Payment has been paid!"
            };
            result(null, resobj);
          }
        } else {
          let resobj = {
            success: true,
            status:false,
            message: "Please check your orderid and moveit user id! / order values is null"
          };

          result(null, resobj);
        }
      }
    }
  );
};

Order.orderhistorybymoveituserid = async function(moveit_user_id, result) {
    const rows = await query(
      "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone,ms.userid as makeituserid,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ors.landmark,ors.flatno from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id =" +
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


      const yesterdaycod = await query("select sum(price) as cod from Orders where moveit_user_id =" +
      moveit_user_id +
      " and DATE(created_at) = DATE(NOW() - INTERVAL 1 DAY) and orderstatus = 6 and payment_type = 0  ");

      console.log(yesterdaycod[0].cod);
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
      yesterdaycod : yesterdaycod[0].cod || 0,
      result: rows
    };
    result(null, resobj);
  }
};



Order.orderlistbymoveituserid = async function(moveit_user_id, result) {

  // const rows = await query(
  //   "Select  ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress,mt.status from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id left join Moveit_status mt on mt.moveitid = ors.moveit_user_id where ors.moveit_user_id =" +moveit_user_id +" and  DATE(ors.ordertime) = CURDATE() group by ors.orderid order by ors.order_assigned_time desc"
  // );

  const rows = await query(
    "Select  ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id where ors.moveit_user_id ="+moveit_user_id+" and  DATE(ors.ordertime) = CURDATE()  group by ors.orderid order by ors.order_assigned_time desc"
);

  const cod_amount = await query(
    "select sum(price) as totalamount from Orders where DATE(created_at) = CURDATE() and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = " +moveit_user_id +"");

    console.log(rows.length);
  if (rows.length == 0) {
    var res = {
      result: "Order not found!",
      status: false,
      success: true,
    };
    result(null, res);
    return;
  }else{

    

    for (let i = 0; i < rows.length; i++) {

      var moveitstatusquery ="select * from Moveit_status  where orderid = " +rows[i].orderid +" order by id desc limit 1";
      var statuslist = await query(moveitstatusquery);
      if (statuslist.length !==0 ) {
        rows[i].status = statuslist[0].status

      }
     

      var url =
        "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
        rows[i].orderid +
        "";
      let products = await query(url);
      rows[i].items = products;
      rows[i].locality = "Guindy";

     
    }
    console.log(cod_amount);
    let resobj = {
      success: true,
      status: true,
      cod_amount :cod_amount[0].totalamount || 0,
      result: rows
    };
  
    result(null, resobj);

  }
};



Order.orderviewbyadmin = function(req, result) {
  sql.query(
    "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'virtualkey',ms.virtualkey) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid ='" +
      req.id +
      "'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var orderDetail=res[0];
        orderDetail.userdetail = JSON.parse(orderDetail.userdetail);
        orderDetail.makeitdetail = JSON.parse(orderDetail.makeitdetail);
        orderDetail.moveitdetail = JSON.parse(orderDetail.moveitdetail);
        orderDetail.items = JSON.parse(orderDetail.items);
        orderDetail.items =orderDetail.items.item;
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

Order.eat_get_delivery_time = function eat_get_delivery_time(req) {


  Order.eat_get_delivery_time_by_moveit_id(req, function(err, res) {
    if (err) return err;
    else return res;
  });
};


Order.orderviewbyeatuser = function(req, result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var orderquery =  "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid =" +
  req.orderid +
  " "
  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length === 0 || res1[0].orderid === null) {
          let resobj = {
            success: true,
            status: false,
            message: "Order not found!",
            result: []
          };
          result(null, resobj);
        } else {


          if ( res1[0].orderstatus < 6 ) {
            
            if ( res1[0].orderstatus < 5 ){
              await Order.eat_get_delivery_time(req);
            }
            

            var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+req.orderid +" order by od_id desc limit 1");
            
            
            if (orderdeliverytime.length !== 0) {
              res1[0].deliverytime = orderdeliverytime[0].deliverytime;
              res1[0].eta = orderdeliverytime[0].duration;
            }else{

              // we need to remove once delivery time stable
              eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
              //15min Food Preparation time , 3min 1 km
           
              res1[0].eta = Math.round(eta) + " mins";
            }

            // we need to remove once delivery time stable
            if (!res1[0].deliverytime) {
              if (res1[0].orderstatus > 3) {
                // +20 min add with moveit order assign time
               res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
             }else{
               var deliverytime = moment(res1[0].ordertime)
               .add(0, "seconds")
               .add(20, "minutes")
               .format("YYYY-MM-DD HH:mm:ss");
               res1[0].deliverytime = deliverytime;
             }
            }

          }


           
                res1[0].servicecharge = constant.servicecharge;
                res1[0].cancellationmessage = constant.cancellationmessage;;
              

                res1[0].payment_type_name ='Cash on delivery'; 
                if (res1[0].payment_type === 1 || res1[0].payment_type === "1") {
                  res1[0].payment_type_name ='Online'; 
                }

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

                  var itemlist = res1[0].items
                  var productprice = 0;
                for (let i = 0; i < itemlist.length; i++) {
                  
                  productprice = productprice + ( itemlist[i].quantity * itemlist[i].price);
                 
                }

                
              
              

                res1[0].trackingstatus = Order.orderTrackingDetail(
                  res1[0].orderstatus,
                  res1[0].moveitdetail
                );
                //}

                var cartdetails = [];
                var totalamountinfo = {};
                var couponinfo = {};
                var gstinfo = {};
                var deliverychargeinfo = {};
                var refundinfo = {};
                var productinfo = {};
                //var grandtotalinfo = {};
        
                    productinfo.title = "Product Price";
                    productinfo.charges = productprice;
                    productinfo.status = true;
                    cartdetails.push(productinfo); 


                  if (res1[0].discount_amount) {
                    couponinfo.title = "Coupon adjustment (-)";
                    couponinfo.charges = res1[0].discount_amount;
                    couponinfo.status = true;
                    cartdetails.push(couponinfo);
                  }
        
                  gstinfo.title = "GST";
                  gstinfo.charges = res1[0].gst;
                  gstinfo.status = true;
                  cartdetails.push(gstinfo);

                  console.log("Handling charge" +res1[0].delivery_charge);

                  if (res1[0].delivery_charge != 0) {
                    deliverychargeinfo.title = "Handling charge";
                    deliverychargeinfo.charges = res1[0].delivery_charge;
                    deliverychargeinfo.status = true;
                    cartdetails.push(deliverychargeinfo);
                  }
                 
        
                  if (res1[0].refund_amount) {
                    refundinfo.title = "Refund adjustment (-)";
                    refundinfo.charges = res1[0].refund_amount;
                    refundinfo.status = true;
                    cartdetails.push(refundinfo);
                  }

                  
                  // totalamountinfo.title = "Total Amount";
                  // totalamountinfo.charges = res1[0].price;
                  // totalamountinfo.status = true;
                  // cartdetails.push(totalamountinfo);
        

                  res1[0].cartdetails = cartdetails;
                let resobj = {
                  success: true,
                  status: true,
                  result: res1
                };

                result(null, resobj);
              //}
          //   }
          // );
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

Order.orderlistbyeatuser = async function(req,result) {

console.log(req);
  var query = "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where us.userid ='" +
            req.userid +
            "' and (ors.orderstatus = 6 or orderstatus = 7 or orderstatus = 8 ) group by ors.orderid order by ors.orderid desc";
  sql.query(query,function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "orders not found!"
          };
          result(null, resobj);
        } else {
           
            history_list =res;
            //history_list.push(res1);
           // history_list = Array.prototype.concat.apply([], history_list);
           for (let i = 0; i < history_list.length; i++) {

            history_list[i].payment_type_name ='Cash on delivery'; 
              if (history_list[i].payment_type === 1 || history_list[i].payment_type === "1") {
                history_list[i].payment_type_name ='Online'; 
              }

             if (history_list[i].userdetail) {
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

             history_list[i].ordercancelstatus = false;
             if (history_list[i].orderstatus === 7 || history_list[i].orderstatus === 8) {
              history_list[i].ordercancelstatus = true;
             }

           }

           
           let resobj = {
             success: true,
             status: true,
             result: history_list
           };

           result(null, resobj);

         //var eat_order_history_query = 'CALL eat_order_history(?)';
        //  sql.query(eat_order_history_query,[req.userid], async function(err, res1) {
        // sql.query(query, async function(err, res1) {
        //     if (err) {
        //       result(err, null);
        //     } else {
              
        //     }
         // });
        }
      }
    }
  );
};

Order.live_order_list_byeatuserid = async function live_order_list_byeatuserid(req,result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;

  const orderdetails = await query("select ors.*,mk.brandname from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.userid ='" +req.userid +"' and ors.orderstatus = 6  and ors.payment_status = 1 order by ors.orderid desc limit 1");
 
  if (orderdetails.length !== 0) {

    orderdetails[0].rating = false;
    orderdetails[0].showrating = false;
    
  if (orderdetails[0].rating_skip < constant.max_order_rating_skip) {
              
    const orderratingdetails = await query("select * from Order_rating where orderid ='" +orderdetails[0].orderid +"'");
   
    var today = moment();
    var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
    var diffMs  = (today - moveit_actual_delivered_time);
    var diffDays = Math.floor(diffMs / 86400000); 
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    if (orderratingdetails.length !== 0) orderdetails[0].rating = true;
    if (diffDays || diffHrs || diffMins > 30) orderdetails[0].showrating = true;

  }
  }
  // or payment_status !=3)
  sql.query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2 order by orderid desc limit 1",function(err, res) {
      if (err) {
        result(err, null);
      } else {
     //   console.log(res.length);
        if (res.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "Active order not found!",
            orderdetails: orderdetails
          };
          result(null, resobj);
        } else {

          
          if (res[0].payment_type === "0" || res[0].payment_type === 0) liveorderquery ="Select distinct ors.orderid,ors.ordertime,ors.order_assigned_time,ors.orderstatus,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid =" +req.userid +" and ors.orderstatus < 6  and payment_status !=2 ";
          else if (res[0].payment_type === "1" || res[0].payment_status === 1) liveorderquery ="Select ors.orderid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";
          else {
            let resobj = {
              success: true,
              status: false,
              message: "Active order not found!",
              orderdetails: orderdetails
            };
            result(null, resobj);
            return;
          }

          sql.query(liveorderquery,async function(err, res1) {
            if (err) {
              result(err, null);
            } else {

            
              if ( res1[0].orderstatus < 6 ) {
            
                if ( res1[0].orderstatus < 5 ){
                   req.orderid  =res1[0].orderid;
                   await Order.eat_get_delivery_time(req);
                }
                
    
                var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+res1[0].orderid +" order by od_id desc limit 1");
                
                
                if (orderdeliverytime.length !== 0) {
                  res1[0].deliverytime = orderdeliverytime[0].deliverytime;
                  res1[0].eta = foodpreparationtime + orderdeliverytime[0].duration;
                }else{
    
                  // we need to remove once delivery time stable
                  eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
                  //15min Food Preparation time , 3min 1 km
               
                  res1[0].eta = Math.round(eta) + " mins";
                }
    
                // we need to remove once delivery time stable
                if (!res1[0].deliverytime) {
                  if (res1[0].orderstatus > 3) {
                    // +20 min add with moveit order assign time
                   res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
                 }else{
                   var deliverytime = moment(res1[0].ordertime)
                   .add(0, "seconds")
                   .add(20, "minutes")
                   .format("YYYY-MM-DD HH:mm:ss");
                   res1[0].deliverytime = deliverytime;
                 }
                }
    
              }
            
            //   if (res1[0].orderstatus > 3) {
            //     // +20 min add with moveit order picked up time
            //    res1[0].deliverytime = res1[0].moveit_actual_delivered_time;
            //  }else{
            //    // +20 min add with moveit order posted time
            //    var deliverytime = moment(res[0].ordertime)
            //    .add(0, "seconds")
            //    .add(20, "minutes")
            //    .format("YYYY-MM-DD HH:mm:ss");
            //    res1[0].deliverytime = deliverytime;
            //  }


            // var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+res1[0].orderid +" order by od_id desc limit 1");
           
            // if (orderdeliverytime.length !== 0) {
            //   console.log("res1"+orderdeliverytime.length);
            //   res1[0].deliverytime = orderdeliverytime[0].deliverytime;
            //   res1[0].eta = orderdeliverytime[0].duration;
            // }else{

            //   // we need to remove once delivery time stable
            //   eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
            //   //15min Food Preparation time , 3min 1 km
           
            //   res1[0].eta = Math.round(eta) + " mins";
            // }
            

            //  // we need to remove once delivery time stable
            //   if (!res1[0].deliverytime) {
            //     if (res1[0].orderstatus > 3) {
            //       // +20 min add with moveit order assign time
            //      res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
            //    }else{
            //      var deliverytime = moment(res1[0].ordertime)
            //      .add(0, "seconds")
            //      .add(20, "minutes")
            //      .format("YYYY-MM-DD HH:mm:ss");
            //      res1[0].deliverytime = deliverytime;
            //    }
            //   }

              

              for (let i = 0; i < res1.length; i++) {
           
                if (res1[i].items) {
                  var items = JSON.parse(res1[i].items);
                  res1[i].items = items.item;
                }
              }

              ///this code only online payment incomplete orderA to return pay the payment If false res1[0].onlinepaymentstatus thay have to repay true track the order,  not for COD
              if (res1[0].payment_type == 1 && res1[0].payment_status == 0 && res1[0].lock_status === 1) {
                res1[0].onlinepaymentstatus = false;
              }else{
                res1[0].onlinepaymentstatus = true;
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
        }
      }
    }
  );
};
//online refund coupon
Order.create_refund = function create_refund(refundDetail) {
  var refund = new RefundOnline(refundDetail);
  RefundOnline.createRefund(refund, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.cod_create_refund_coupon_servicecharge = function cod_create_refund_coupon_servicecharge(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
  console.log(rc)
   RefundCoupon.create_Refund_Coupon_online_orders_servicecharge(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.create_Refund_Coupon_by_totalamount_servicecharge = function create_Refund_Coupon_by_totalamount_servicecharge(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
  console.log(rc)
   RefundCoupon.create_Refund_Coupon_by_totalamount_servicecharge(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.eat_order_cancel = async function eat_order_cancel(req, result) {

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");

  if (orderdetails[0].orderstatus < 5) {
    sql.query("UPDATE Orders SET orderstatus = 7,cancel_by = 1,cancel_reason= '" +req.cancel_reason +"',cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          
          var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
                    
        //  console.log(orderitemdetails);
          for (let i = 0; i < orderitemdetails.length; i++) {
            var productquantityadd ="update Product set quantity = quantity+" +orderitemdetails[i].quantity +" where productid =" +orderitemdetails[i].productid +"";

            var res3 = await query(productquantityadd);
            
          }

          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };

          var totalrefund = orderdetails[0].price + orderdetails[0].refund_amount;
          var querycancel_charge ="update Orders set cancel_charge = "+constant.servicecharge+"  where orderid =" +req.orderid+"";
          /// check the order refunded amount and payment status
          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status === 1) {
            
            /// check the order refunded amount and payment type 
          if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
 
                
              if (orderdetails[0].refund_amount  > constant.servicecharge) {
                //online user paid and used refund coupon amount so after he cancel order . so detect the serivice charge
               
                await Order.cod_create_refund_coupon_servicecharge(refundDetail);
                await Order.create_refund(refundDetail);
                await Notification.orderEatPushNotification(req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );
                var updatecancel_charge = await query(querycancel_charge);
              }else if (orderdetails[0].price  > constant.servicecharge){
                console.log("price service charge");
                refundDetail.original_amt = orderdetails[0].price - constant.servicecharge;
                await Order.create_refund(refundDetail);
                await Notification.orderEatPushNotification(
                  req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );

                //online user paid and used refund coupon amount so after he cancel order . so create refund again
                if (orderdetails[0].refund_amount !== 0) {
                  console.log("Online cod refund");
                 await Order.cod_create_refund_byonline(refundDetail);
                 var updatecancel_charge = await query(querycancel_charge);
                }

              }else if (totalrefund  > constant.servicecharge){
               //online order paid and used refund amount . and total amount was too low comparing serivce charge so summ of price and refundamount and defetect service charge
                await Order.create_Refund_Coupon_by_totalamount_servicecharge(refundDetail);
                await Notification.orderEatPushNotification(
                  req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );

                var updatecancel_charge = await query(querycancel_charge);
                

               
    
              }

          }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon_by_id(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } else{
                let response = {
                  success: true,
                  status: true,
                  message: "Refunded created successfully."
                };
                result(null, response);
            
              }
            });
          }
      
          }
                   
          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
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

Order.remove_used_coupon = function remove_used_coupon(removecoupon) {

   CouponUsed.remove_coupon_by_userid(removecoupon, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.makeit_order_cancel = async function makeit_order_cancel(req, result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");


  var cancel_reason = req.cancel_reason || null ;
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
    sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2 ,cancel_time = '" +ordercanceltime+"',cancel_reason='" +cancel_reason+"' WHERE orderid ='" +req.orderid +"'",
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
                result(err, null);
              }
            });
          }

          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

            if (orderdetails[0].payment_type === "1" && orderdetails[0].payment_status === 1){
              
              await Order.create_refund(refundDetail);
              if (orderdetails[0].refund_amount !== 0) {
                console.log("Online cod refund");
               await Order.cod_create_refund_byonline(refundDetail);
               
              }


            }else if (orderdetails[0].payment_type === "0" && orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } 
            });
          }
          }

          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          
          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }

        

          let response = {
            success: true,
            status: true,
            message: "Order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  }
};

Order.insert_delivery_time = function insert_delivery_time(req) {
  var new_OrderDeliveryTime = new OrderDeliveryTime(req);
  OrderDeliveryTime.createOrderDeliveryTime(new_OrderDeliveryTime, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.makeit_order_accept = async function makeit_order_accept(req, result) {
  const orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid ='" + req.orderid + "'");
  var makeitaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
  // d.setHours(d.getHours() + 5);
  if (orderdetails.length !== 0) {
    if (orderdetails[0].orderstatus < 1) {
      var orderaccepttime = moment()
        .add(0, "seconds")
        .add(constant.foodpreparationtime, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");
      // deliverytime.setMinutes(transaction_time.getMinutes() + 15);     
      updatequery ="UPDATE Orders SET makeit_status=1,orderstatus = 1 ,makeit_expected_preparing_time= '" + orderaccepttime +"',makeit_accept_time= '" + makeitaccepttime +"' WHERE orderid ='" +req.orderid +"'";
     
      sql.query(updatequery, async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_accept
          );

          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          req.deslat = orderdetails[0].cus_lat;
          req.deslon = orderdetails[0].cus_lon;
          req.hubid= orderdetails[0].makeithub_id;


          Order.eat_order_distance_calculation(req ,async function(err,res3) {
            if (err) {
              result(err, null);
            } else {
              if (res3.status != true) {
                result(null, res3);
              } else {
    
                var routes = res3.result;
                var caldistance = routes.routes;
                var deliverytimedata = caldistance[0].legs;
               
                req.distance = parseInt(deliverytimedata[0].distance.text);
                req.duration = parseInt(deliverytimedata[0].duration.text);

              
                 req.duration = constant.foodpreparationtime + req.duration + constant.orderbuffertime;
                 req.deliverytime  = moment().add(0, "seconds").add(req.duration, "minutes").format("YYYY-MM-DD HH:mm:ss");

                 await Order.insert_delivery_time(req);

                 Order.auto_order_assign(req ,async function(err,auto_order_data) {
                  if (err) {
                    result(err, null);
                  } else {
                    if (auto_order_data.status != true) {
                      result(null, auto_order_data);
                    } else {



                      let response = {
                        success: true,
                        status: true,
                        message: "Order accepted successfully."
                       // result :deliverytimedata 
                      };
                      result(null, response);
                    }
                  }
                });
      



                // let response = {
                //   success: true,
                //   status: true,
                //   message: "Order accepted successfully.",
                //  // result :deliverytimedata 
                // };
                // result(null, response);
              }
            }
          });

        }
      });
    } else if (orderdetails[0].orderstatus == 1) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order already accepted"
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
        message: "order not found please check"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "order not found please check"
    };
    result(null, response);
  }
};

Order.insert_order_status = function insert_order_status(req) {
  var new_MoveitStatus = new MoveitStatus(req);
  MoveitStatus.createMoveitStatus(new_MoveitStatus, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.moveit_order_accept = async function moveit_order_accept(req, result) {

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "' ");
  const ordermoveitstatus = await query("select * from Moveit_status where orderid ='" + req.orderid + "' ");

  // d.setHours(d.getHours() + 5);
  if (orderdetails.length !== 0) {

    if (orderdetails[0].moveit_status < 1 ) {
      req.moveitid = req.moveituserid;
      req.status = 1;
    //  if (orderdetails[0].moveit_user_id === req.moveituserid || orderdetails[0].moveit_user_id === "req.moveituserid") {
      if (ordermoveitstatus.length == 0) {
        await Order.insert_order_status(req);
      }
      
      
      var orderaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
   
      updatequery ="UPDATE Orders SET moveit_status = 1 ,moveit_accept_time= '" + orderaccepttime +"' WHERE orderid ='" +req.orderid +"'";
     
      sql.query(updatequery, async function(err, res) {
        if (err) {
          result(err, null);
        } else {
        
          let response = {
            success: true,
            status: true,
            message: "Order accepted successfully."
          };
          result(null, response);
        }
      });
   
    } else if (orderdetails[0].moveit_status == 1) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order already accepted"
      };
      result(null, response);
    } else {
      let response = {
        success: true,
        status: false,
        message: "order not found please check test"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "order not found please check "
    };
    result(null, response);
  }
};

Order.order_missing_by_makeit = async function order_missing_by_makeit(req, result) {
  const orderdetails = await query(
    "select * from Orders where orderid ='" + req.orderid + "'"
  );

  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
  if (orderdetails[0].orderstatus === 8) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  } else {
    sql.query("UPDATE Orders SET orderstatus = 8,cancel_by = 2,cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
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
                result(err, null);
              }
            });
          }

          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

            if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
              
              await Order.create_refund(refundDetail);
              if (orderdetails[0].refund_amount !== 0) {
                console.log("Online cod refund");
               await Order.cod_create_refund_byonline(refundDetail);
               
              }


          }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } 
            });
          }
          }

          
          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          
          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }
          let response = {
            success: true,
            status: true,
            message: "Order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  }
};

Order.admin_order_cancel = async function admin_order_cancel(req, result) {

 var cancel_reason=req.cancel_reason||""
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
    sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
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
                result(err, null);
              }
            });
          }

          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

            if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
              
              await Order.create_refund(refundDetail);
              if (orderdetails[0].refund_amount !== 0) {
                console.log("Online cod refund");
               await Order.cod_create_refund_byonline(refundDetail);
               
              }


          }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } 
            });
          }
          }

          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          
          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }
          let response = {
            success: true,
            status: true,
            message: "Order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  }
};


// this code is online order cod refund creation
Order.cod_create_refund_byonline = function cod_create_refund_byonline(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
  console.log(rc)
   RefundCoupon.create_Refund_Coupon_online_orders(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};


Order.eat_order_item_missing_byuserid = async function eat_order_item_missing_byuserid(req,result) {

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
  if (orderdetails) {
    
    if (orderdetails[0].orderstatus === 6) {

      var today = moment();
      var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
      var diffMs  = (today - moveit_actual_delivered_time);
      var diffDays = Math.floor(diffMs / 86400000); 
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  
      ///minimum 24 hours for item missing or 1 day
      console.log(diffDays);  
      if (diffDays < 3) {

       
      sql.query("UPDATE Orders SET item_missing = 1,item_missing_reason='" +req.item_missing_reason +"' WHERE orderid ='" +req.orderid +"'",async function(err, res1) {
          if (err) {
            result(err, null);
          } else {


            var refundDetail = {
              orderid : req.orderid,
              original_amt : orderdetails[0].price,
              active_status : 1,
              userid : orderdetails[0].userid,
              payment_id : orderdetails[0].transactionid
            };
           

            if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_type === 0) {

              var rc = new RefundCoupon(req);
              RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
                if (err) {
                  result(err, null);
                } else{

                  let response = {
                    success: true,
                    status: true,
                    message: "Refunded created successfully."
                  };
                  result(null, response);
              
                }
              });

            } else if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_type === 1) {
              

              if (orderdetails[0].price !==0) {
                console.log("Online refund");
                await Order.create_refund(refundDetail);
              }
            

            if (orderdetails[0].refund_amount !== 0) {
              console.log("Online cod refund");
             await Order.cod_create_refund_byonline(refundDetail);
             
            }
 
                
              
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

      }else{

        let response = {
          success: true,
          status: false,
          message: "Sorry can't create the item missing due to time 1 day extened."
        };
        result(null, response);

      }
  
  
    } else if(orderdetails[0].orderstatus === 7){
      let response = {
        success: true,
        status: false,
        message: "Order already canceled."
      };
      result(null, response);
    }else {
      let response = {
        success: true,
        status: false,
        message: "Order not yet to delivered."
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "Order is not available"
    };
    result(null, response);
  }
};


Order.get_order_waiting_list = function get_order_waiting_list(req, result) {
  var waitinglistquery = "SELECT ors.orderid,ors.ordertime,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail from Orders as ors left join MakeitUser ms on ors.makeit_user_id = ms.userid WHERE  ors.orderstatus=0 and ors.lock_status = 0 and ors.payment_status!=2 and (ors.created_at+ INTERVAL 6 MINUTE) < now() group by ors.orderid order by ors.orderid  desc";
  sql.query(waitinglistquery, function(err,res1) {
    if (err) {
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

Order.moveit_delivery_cash_received_by_today_by_userid = async function moveit_delivery_cash_received_by_today_by_userid(req,result) {
  req.startdate = req.startdate+" 00:00:00";
  req.enddate = req.enddate+" 23:59:59";
  var moveitquery = "select * from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = '"+req.userid+"' ";
  var moveitqueryamount = moveitquery+";"+"select sum(price) as totalamount from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = '"+req.userid+"' ";
  sql.query(moveitqueryamount,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          cod_amount:res[1][0].totalamount,
          result: res[0]
        };
        result(null, resobj);
      }
    }
  );
};


Order.get_orders_cash_online_amount = async function get_orders_cash_online_amount(req,result) {
  req.startdate = req.startdate;
  req.enddate = req.enddate;
  var paymentType=req.payment_type;
  var orderquery = "select * from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and moveit_user_id!=0";
  var orderamountquery ="select sum(price) as totalamount from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and moveit_user_id!=0";
  
  if(paymentType===0||paymentType===1){
    orderquery=orderquery+" and payment_type = "+paymentType;
    orderamountquery=orderamountquery+" and payment_type = "+paymentType;  
  }
  var orderamountquery =orderquery+";"+orderamountquery;
  
  sql.query(orderamountquery,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          totalamount:res[1][0].totalamount,
          result: res[0]
        };
        result(null, resobj);
      }
    }
  );
};

Order.eat_order_skip_count_by_uid = async function eat_order_skip_count_by_uid(req,result) {

  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"'");

  if (orderdetails.length !==0) {
    
    rating_skip =  orderdetails[0].rating_skip + 1;

    var skipupdatequery = await query("update Orders set rating_skip = "+rating_skip+"  where orderid = '"+req.orderid+"'");
    if (skipupdatequery.err) {
      let resobj = {
        success: true,
        status:false,
        result: err
      };
      result(null, resobj);
    }
    let resobj = {
      success: true,
      status: true,
      message:"Rating skip updated",
      result: orderdetails
    };
    result(null, resobj);

  }else{

    let resobj = {
      success: true,
      status:false,
      message:"There is no orders found!",
      result: orderdetails
    };
    result(null, resobj);

  }

};

// Order.eat_get_delivery_time_by_moveit_id = async function eat_get_delivery_time_by_moveit_id(req,result) {

//   var orderdetails = await query("select *,( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( cus_lat ) )  * cos( radians( cus_lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(cus_lat)) ) ) AS distance from Orders where orderid = "+req.orderid+" ");

//   if (orderdetails.length !==0) {
  
//  //var eta = constant.onekm + Math.round(constant.onekm * orderdetails[0].distance);

//  var deliverytime = moment()
//         .add(0, "seconds")
//         .add(eta, "minutes")
//         .format("YYYY-MM-DD HH:mm:ss");
    
//         orderdetails[0].deliverytime = deliverytime;  

//     let resobj = {
//       success: true,
//       status: true,
//       result: orderdetails
//     };
//     result(null, resobj);

//   }else{

//     let resobj = {
//       success: true,
//       status:false,
//       message:"There is no orders found!",
//       result: orderdetails
//     };
//     result(null, resobj);

//   }

// };


Order.get_sales_product_count = async function get_sales_product_count(req,result) {
  //req.date = req.date;
  // var query =
  // "Select JSON_OBJECT('productitem', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items"+ 
  // " from Orders as od"+ 
  // " left join MakeitUser as mk on mk.userid=od.makeit_user_id"+
  // " left join OrderItem ci ON ci.orderid = od.orderid"+ 
  // " left join Product pt on pt.productid = ci.productid"+
  // " where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = 6";

  var query ="SELECT c.productid,p.product_name,COUNT(*) product_count FROM OrderItem as c JOIN Product p on p.productid= c.productid Where c.orderid IN(SELECT orderid FROM Orders Where DATE(ordertime) = "+req.date+" and payment_status=1 and orderstatus = 6) GROUP BY c.productid ORDER BY product_count DESC";
  sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else{
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
}

Order.moveit_notification_time_orderid = async function moveit_notification_time_orderid(req,result) {

  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"'");

  if (orderdetails.length !==0) {
    
    var currenttime = moment().format("YYYY-MM-DD HH:mm:ss");

    var skipupdatequery = await query("update Orders set moveit_notification_time = '"+currenttime+"'  where orderid = '"+req.orderid+"'");
    if (skipupdatequery.err) {
      let resobj = {
        success: true,
        status:false,
        result: err
      };
      result(null, resobj);
    }
    let resobj = {
      success: true,
      status: true,
      message:"Order moveit notification updated"
    };
    result(null, resobj);

  }else{

    let resobj = {
      success: true,
      status:false,
      message:"There is no orders found!",
      result: orderdetails
    };
    result(null, resobj);

  }

};


Order.eat_order_distance_calculation = async function eat_order_distance_calculation(req,result) {
 
//https://maps.googleapis.com/maps/api/directions/json?origin=12.9801,80.2184&destination=13.0072,80.2064&key=AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc
  var diatnceurl =
  "https://maps.googleapis.com/maps/api/directions/json?origin="+req.orglat+","+req.orglon+"&destination="+req.deslat+","+req.deslon+"&key="+constant.distanceapiKey+"";

  
  request(  
    {
      method: "GET",
      rejectUnauthorized: false,
      url: diatnceurl
    },
    function(error,data) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
      
        if (data.statusCode === 200) {
          routesdata = JSON.parse(data.body)
    
          let resobj = {
            success: true,
            status:true,
            result: routesdata
          };
          result(null, resobj);
        }else{
          routes = JSON.parse(data.body)

          let resobj = {
            success: true,
            status: false,
            result: data
          };
          result(null, resobj);
        }
           
      }
    }
  );

};


Order.createMoveitReassignedOrders = function createMoveitReassignedOrders(reassignorders) {

  var ReassignedOrders = new MoveitReassignedOrders(reassignorders);
 
  MoveitReassignedOrders.createMoveitReassignedOrders(ReassignedOrders, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.reassign_orders_by_id =async function reassign_orders_by_id(req, result) {
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"' ");

if (orderdetails[0].orderstatus <= 5) {
    
  sql.query("Select online_status,pushid_android,pushid_ios From MoveitUser where userid= '" +req.moveit_user_id +"' ",async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        var online_status = res1[0].online_status;

        

        if (online_status == 1) {

          var moveitstatusupdate = await query("update Moveit_status set moveitid = '"+req.moveit_user_id+"' where moveitid = '"+orderdetails[0].moveit_user_id+"'");

          sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ?,moveit_status=0 WHERE orderid = ?",[req.moveit_user_id, assign_time, req.orderid],async function(err, res2) {
              if (err) {
                result(err, null);
              } else {
                var reassignorders  = {};
              
                reassignorders.orderid = req.orderid;
                reassignorders.moveit_userid = orderdetails[0].moveit_user_id;
                reassignorders.notification_time =orderdetails[0].notification_time;
                reassignorders.accept_time =orderdetails[0].accept_time;
                reassignorders.reason = req.reason;

                await Order.createMoveitReassignedOrders(reassignorders);

                await Notification.orderMoveItPushNotification(
                  req.orderid,
                  PushConstant.pageidMoveit_Order_Assigned,
                  res1[0]
                );
                await Notification.orderMoveItPushNotification(
                  req.orderid,
                  PushConstant.pageidMoveit_Order_Reassign,
                  await Notification.getMovieitDetail( orderdetails[0].moveit_user_id)
                );
                let resobj = {
                  success: true,
                  status:true,
                  message: "Order Re-Assigned Successfully"
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
  }else if(orderdetails[0].orderstatus === 6){

    let resobj = {
      success: true,
      status: false,
      message: "Order already delivered"
    };
    result(null, resobj);
  }else if(orderdetails[0].orderstatus === 7){

    let resobj = {
      success: true,
      status: false,
      message: "Order already cancelled"
    };
    result(null, resobj);
  }else{

    let resobj = {
      success: true,
      status: false,
      message: "Waiting for order assign"
    };
    result(null, resobj);
  }
};


Order.eat_get_delivery_time_by_moveit_id = async function eat_get_delivery_time_by_moveit_id(req,result) {
 

  var orderdetails = await query("select od.deliverytime,od.duration,od.distance,od.orderid,ors.orderstatus,ors.cus_lat,ors.cus_lon,mk.lat as makeit_lat,mk.lon as makeit_lon from Order_deliverytime od join Orders ors on od.orderid=ors.orderid join MakeitUser mk on mk.userid=ors.makeit_user_id where od.orderid = "+req.orderid+"  order by od.od_id desc limit 1");
 // var orderdeliverytimedetails = await query("select * from Order_deliverytime where orderid = "+req.orderid+"  and deliverytime < NOW()  order by od_id desc limit 1");
 
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour  = moment(day).format("HH:mm:ss");
 
  // if (orderdetails[0].deliverytime) {
    if (orderdetails.length !== 0) {
  var deliverytime = moment(orderdetails[0].deliverytime).format("YYYY-MM-DD HH:mm:ss");
  var deliveryhours = moment(deliverytime).format("HH:mm:ss");  

 
                
    if (deliveryhours <= currenthour)  {

      
        req.deslat = orderdetails[0].cus_lat;
        req.deslon = orderdetails[0].cus_lon;
       
        if (orderdetails[0].orderstatus < 5) {
          
          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
        }else if (orderdetails[0].orderstatus == 5){
    
          if (req.lat) {
            req.orglat = req.lat;
            req.orglon = req.lon;
          }else{
            req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          }
          
    
        }else{
          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
        }

        Order.eat_order_distance_calculation(req ,async function(err,res3) {
          if (err) {
            result(err, null);
          } else {
            if (res3.status != true) {
              result(null, res3);
            } else {
    
              
              var routes = res3.result;
              var caldistance = routes.routes;
              var deliverytimedata = caldistance[0].legs;
             
              req.distance = parseInt(deliverytimedata[0].distance.text);
               req.duration = parseInt(deliverytimedata[0].duration.text);
               req.duration = constant.foodpreparationtime + req.duration + constant.orderbuffertime;
               req.deliverytime  = moment()
               .add(0, "seconds")
               .add(req.duration, "minutes")
               .format("YYYY-MM-DD HH:mm:ss");
    
               await Order.insert_delivery_time(req);
                            
              let response = {
                success: true,
                status: true,
                message: "On the way your food."
               // deliverytime : res3
              };
              result(null, response);
            }
          }
        });

   

    }else{
      let resobj = {
        success: true,
        status: false,
        message: "On the way your food",
        deliverytime : orderdetails[0].deliverytime
    }
    
    result(null, resobj);
  }
   

  }else{

    let resobj = {
      success: true,
      status: false,
      message: "delivery time not found"
  
    };
    result(null, resobj);

  }
  // }else{
  //   let resobj = {
  //     success: true,
  //     status: false,
  //     message: "Delivery time not found",
     
  
  //   };
  //   result(null, resobj);
  // }
};

Order.moveit_customer_location_reached_by_userid = function(req, result) {
  var customerlocationreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log(customerlocationreachtime);

  sql.query("Select * from Orders where orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      var getmoveitid = res1[0].moveit_user_id;
      if (getmoveitid == req.moveit_user_id) {

        req.moveitid = req.moveit_user_id;
        req.status = 5 // order pickup by moveit
        await Order.insert_order_status(req);

        sql.query(
          "UPDATE Orders SET moveit_customerlocation_reached_time = ? WHERE orderid = ? and moveit_user_id =?",
          [           
            customerlocationreachtime,
            req.orderid,
            req.moveit_user_id
          ],
          function(err, res) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status:true,
                message: "Customer location reached successfully"
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

Order.moveit_unaccept_orders_byid = function moveit_unaccept_orders_byid(req, result) {
 
  sql.query("Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress,ors.moveit_status,ors.moveit_accept_time from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id where ors.moveit_user_id = ?  and (ors.moveit_status IS NULL OR ors.moveit_status = '') and DATE(ors.ordertime) = CURDATE() and ors.moveit_user_id !=0 and ors.orderstatus < 5 order by  ors.order_assigned_time desc ", [req.moveit_user_id],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {

              let resobj = {
                success: true,
                status:true,
                result: res1
              };
              result(null, resobj); 
         
      
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "Orders not found!"
        };
        result(null, resobj);
      }
    }
  });
};


Order.insert_force_delivery = function insert_force_delivery(req) {
  var new_createForcedeliverylogs = new createForcedeliverylogs(req);
  createForcedeliverylogs.createForcedeliverylogs(new_createForcedeliverylogs, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.order_delivery_status_by_admin = function order_delivery_status_by_admin(req, result) {
  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",[req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length !== 0) {

          if (res1[0].orderstatus == 6) {
            let resobj = {
              success: true,
              message: "Sorry!  order was already deliverd.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus == 7) {
            let resobj = {
              success: true,
              message: "Sorry!  order already canceled.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus < 3) {
            let resobj = {
              success: true,
              message: "Sorry! Order not prepared",
              status:false
            };
            result(null, resobj);
          }else{

          if (res1[0].payment_status == 1) {

            req.moveitid = req.moveit_user_id;
            req.moveit_userid = req.moveit_user_id;
            req.status = 7
            await Order.insert_order_status(req); 

            await Order.insert_force_delivery(req); 

            sql.query(
              "UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
              [ order_delivery_time, req.orderid, req.moveit_user_id],
              async function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    message: "Order Delivery successfully",
                    status:true,
                    orderdeliverystatus: true
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
            let resobj = {
              success: true,
              status:false,
              message: "Payment not yet paid!",
              orderdeliverystatus: false
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            message: "Sorry! no order found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_order_payment_status_by_moveituser = function(req, result) {
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length > 0) {

          // check the payment status - 1 is paid

          if (res1[0].orderstatus < 3) {
            let resobj = {
              success: true,
              message: "Sorry order not prepared.",
              status:false
            };
            result(null, resobj);
          }else{

          


          if (res1[0].payment_status == 0) {

            req.moveitid = req.moveit_user_id;
            req.status = 6
            await Order.insert_order_status(req); 
           
            sql.query(
              "UPDATE Orders SET payment_status = ? WHERE orderid = ? and moveit_user_id =?",
              [req.payment_status, req.orderid, req.moveit_user_id],
              function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    status:true,
                    message: "Cash received successfully"
                  };
                  result(null, resobj);
                }
              }
            );
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Already Payment has been paid!"
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            status:false,
            message: "Please check your orderid and moveit user id! / order values is null"
          };

          result(null, resobj);
        }
      }
    }
  );
};


Order.admin_orders_count_by_moveit= function admin_orders_count_by_moveit(req, result) {
 
  sql.query("SELECT mo.userid, mo.name, count(*) as count,CURDATE()  FROM Orders as ors JOIN MoveitUser as mo ON ors.moveit_user_id = mo.userid where ors.orderstatus=6 and Date(ors.created_at)= CURDATE() Group by mo.userid ",async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {

              let resobj = {
                success: true,
                status:true,
                result: res1
              };
              result(null, resobj); 
         
      
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "Orders not found!"
        };
        result(null, resobj);
      }
    }
  });
};


Order.moveit_no_of_orders = function moveit_no_of_orders(req, result) {
  sql.query(
    "SELECT M.userid, M.name, count(*) as no_of_orders FROM Orders as Ord JOIN MoveitUser as M ON Ord.moveit_user_id = M.userid where Ord.orderstatus=6 and Date(Ord.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' Group by M.userid",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.order_turnaround_time_makeit = function order_turnaround_time_makeit(req, result) {
  sql.query(
    "Select orderid,ordertime,TIMEDIFF(makeit_accept_time,ordertime) as Accep_time,TimeDiff(makeit_actual_preparing_time, makeit_accept_time) as Preparation_time , ADDTIME(TIMEDIFF(makeit_accept_time,ordertime),TimeDiff(makeit_actual_preparing_time, makeit_accept_time)) as Totaltime from Orders as Ord  where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};


Order.order_turnaround_time_moveit = function order_turnaround_time_moveit(req, result) {
  var query="Select Ord.orderid,Ord.ordertime,TIMEDIFF(moveit_accept_time,order_assigned_time) as Moveit_Accept_time, TimeDiff(moveit_actual_delivered_time,moveit_pickup_time) as Moveit_delivered_time , ADDTIME(TIMEDIFF(moveit_accept_time,order_assigned_time) ,TimeDiff(moveit_actual_delivered_time,moveit_pickup_time) ) as Totaltime from `Orders` as Ord  where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order. orders_canceled= function orders_canceled(req, result) {
  sql.query("Select ord.orderid,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.orders_cost = function orders_cost(req, result) {
  sql.query("Select orderid,ordertime,original_price,discount_amount from Orders where orderstatus=6 and Date(created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_via_order_delivey = function admin_via_order_delivey(req, result) {
  sql.query("select orderid, if(admin_id=1,'EAT','Kitchen') as who, reason, created_at from Force_delivery_logs where Date(created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//New Users
Order.new_users = function new_users(req, result) {
  //sql.query("Select u.userid, u.phoneno from User as u join Orders as o on o.userid=u.userid where o.orderstatus=6  and Date(u.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
  sql.query("Select u.userid, u.phoneno,u.created_at,u.name from User as u where Date(u.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Total new user orders
Order.new_users_orders = function new_users_orders(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(u.created_at) between '"+req.fromdate+"' AND '"+req.todate+"' GROUP BY u.userid Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Total Retained Customer Report
Order.retained_customer = function retained_customer(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(o.created_at) between '"+req.fromdate+"' and '"+req.todate+"' GROUP BY u.userid HAVING Count(DISTINCT o.orderid) > 1 Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//No of orders per user
Order.user_orders_history = function user_orders_history(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(o.created_at) between '"+req.fromdate+"' and '"+req.todate+"' GROUP BY u.userid Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Date Wise Sales Report  
Order.datewise_sales = function datewise_sales(req, result) {
  sql.query("Select DATE(o.created_at) as todaysdate, count(*) as Delivered_Orders, sum(price) as Totalmoney_received,sum(gst) as gst ,sum(original_price) as Totalmoney_without_discount, sum(refund_amount) as refund_coupon_amount,sum(discount_amount) as discount_amount,sum(ro.refund_amt) as refund_online, sum(ro.cancellation_charges) as cancellation_charges,sum(delivery_charge) as delivery_charge,if(o.payment_type=1,'Online','Cash') as payment_type  from Orders as o left join Refund_Online as ro on ro.orderid=o.orderid where orderstatus=6  and payment_type = "+req.payment_type+" and Date(o.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' group by Date(o.created_at);",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Canceled orders between date
Order.cancel_orders = function cancel_orders(req, result) {
  sql.query("Select ord.orderid,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Driver wise COD Settlement 
Order.driverwise_cod = async function driverwise_cod(req,result) {
  var moveitqueryamount ="select mo.userid,mo.name,mo.phoneno,count(o.orderid) as ordercount ,sum(o.price) as totalamount  from Orders as o left join MoveitUser as mo on mo.userid= o.moveit_user_id where Date(o.moveit_actual_delivered_time) between '"+req.fromdate+"' and '"+req.todate+"' and o.orderstatus = 6  and o.payment_status = 1 and o.payment_type = 0 Group by mo.userid";
  sql.query(moveitqueryamount,function(err, res) {
      if (err) {
        result(err, null);
      } else{
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

//Total delivered orders between date  and hub
Order.hub_total_delivery = async function hub_total_delivery(req,result) {
  var hubfilter="";
  if(req.makeithub_id){
    hubfilter = " and M.makeithub_id='"+req.makeithub_id+"'";
   }
  var selectquery = "SELECT count(*) as orders_count,Date(Ord.created_at) as ordertime FROM Orders as Ord JOIN MakeitUser as M ON Ord.makeit_user_id = M.userid where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'"+hubfilter+" group by date(Ord.created_at);";
  sql.query(selectquery,function(err, res) {
      if (err) {
        result(err, null);
      } else{
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

//Product wise report
Order.product_wise = function product_wise(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid ,ord.productid, sum(ord.quantity) as quan, m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid  join MakeitUser as m on m.userid=pr.makeit_userid  left outer join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and  orde.orderstatus=6 group by ord.productid order by quan desc";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Orders report
Order.orders_report = function orders_report(req, result) {
  var query="Select o.orderid,o.original_price,o.refund_amount,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,o.order_assigned_time,o.makeit_accept_time,o.makeit_actual_preparing_time,o.moveit_pickup_time,o.moveit_actual_delivered_time,o.created_at,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid	where o.orderstatus=6 and (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//tunnel order
Order.create_tunnel_order_new_user = async function create_tunnel_order_new_user(req,orderitems,result) {

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
 // var currenthour = 23
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var dinnerend = constant.dinnerend;

  const delivery_charge = constant.deliverycharge;
  // console.log(currenthour);
  // console.log(dinnerend);
 // if (currenthour >= breatfastcycle && currenthour <= dinnerend) {
     
    // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
 

    // if (res.length === 0 ) {

    //get address 
      const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
    //console.log("address_data-->",address_data);
    if(address_data.length === 0) {
      let resobj = {
                success: true,
                status: false,
                message: "Sorry your selected address wrong.Please select correct address."
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
                  req.makeit_earnings = amountdata.makeit_earnings; 
                  req.cus_address = address_data[0].address;
                  req.locality = address_data[0].locality;
                  req.cus_lat = address_data[0].lat;
                  req.cus_lon = address_data[0].lon;
                  req.address_title = address_data[0].address_title;
                  req.locality_name = address_data[0].locality;
                  req.flatno = address_data[0].flatno;
                  req.landmark = address_data[0].landmark;
                  req.coupon = req.cid
                  req.orderstatus = 10;
                  req.payment_status = 3;
                  req.payment_type = 3;


                  Order.OrderInsert_tunnel_user(req, res3.result[0].item,true,false,async function(err,res){
                    if (err) {
                      result(err, null);
                    } else {
                    
                      result(null, res);
                    }
                  });

                 
                }
              }
            });
      }

};

Order.OrderInsert_tunnel_user = async function OrderInsert_tunnel_user(req, orderitems,isMobile,isOnlineOrder,result) {
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
          Orderitem.createOrderitems_by_tunnel(items, function(err, res2) {
            //if (err) result.send(err);
            if (err) { 
              sql.rollback(function() {
                result(err, null);
              });
            }
          });

          
        }
            req.orderid = orderid;
            req.refundamount = constant.tunnel_refund_amout;
            var rc = new RefundCoupon(req);
           
              RefundCoupon.createRefundCoupon_by_tunnel_user(rc, async function(err, res2) {
                if (err) {
                  result(err, null);
                } 
              });

        var updatetunnel = await query("update User set first_tunnel = 0 where userid = "+req.userid+" ");

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

Order.kitchenwise_report = function kitchenwise_report(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Product wise Virual Kitchen report
Order.product_wise_virtual = function product_wise_virtual(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid,mh.makeithub_name ,ord.productid, sum(ord.quantity) as quan, m.brandname,mh.address as hub_location from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid join MakeitUser as m on m.userid = pr.makeit_userid join Makeit_hubs as mh on m.makeithub_id = mh.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and m.virtualkey=1 and  orde.orderstatus=6 group by ord.productid order by quan desc;";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Product wise Real Kitchen report
Order.product_wise_real = function product_wise_real(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid,mh.makeithub_name ,ord.productid, sum(ord.quantity) as quan, m.brandname,m.address as hub_location from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid join MakeitUser as m on m.userid = pr.makeit_userid left join Makeit_hubs as mh on m.makeithub_id = mh.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and m.virtualkey=0 and  orde.orderstatus=6 group by ord.productid order by quan desc;";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Virtual Kitchen Orders report
Order.virtual_orders_report = function virtual_orders_report(req, result) {
  var query="Select o.orderid,o.original_price,o.refund_amount,sum(o.makeit_earnings) as MakeitEarnings,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,o.order_assigned_time,o.makeit_accept_time,o.makeit_actual_preparing_time,o.moveit_pickup_time,o.moveit_actual_delivered_time,o.created_at,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,ma.address as hub_location from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid join Makeit_hubs as mh on ma.makeithub_id=mh.makeithub_id where o.orderstatus=6 and ma.virtualkey=1 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Real Kitchen Orders report
Order.real_orders_report = function real_orders_report(req, result) {
  var query="Select o.orderid,o.original_price,o.refund_amount,sum(o.makeit_earnings) as MakeitEarnings,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,o.order_assigned_time,o.makeit_accept_time,o.makeit_actual_preparing_time,o.moveit_pickup_time,o.moveit_actual_delivered_time,o.created_at,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid left join Makeit_hubs as mh on ma.makeithub_id=mh.makeithub_id where o.orderstatus=6 and ma.virtualkey='0' and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Daywise Virtual Makeit Earnings report
Order.virtual_makeit_earnings = function virtual_makeit_earnings(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Daywise Real Makeit Earnings report
Order.real_makeit_earnings = function real_makeit_earnings(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_order_pickup_cancel = async function admin_order_pickup_cancel(req, result) {

  var cancel_reason=req.cancel_reason||""
   const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
 
   if (orderdetails[0].orderstatus == 7 ) {
     let response = {
       success: true,
       status: false,
       message: "Sorry! order already canceled."
     };
     result(null, response);
   }else if(orderdetails[0].orderstatus == 6){
       let response = {
         success: true,
         status: false,
         message: "Sorry! This order has been already deliverd."
       };
       result(null, response);
 
   } else {
    var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
     sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"',cancel_status = 2,cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
         if (err) {
           result(err, null);
         } else {
           var refundDetail = {
             orderid: req.orderid,
             original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
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
                 result(err, null);
               }
             });
           }
 
           if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {
 
             if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
               
               await Order.create_refund(refundDetail);
               if (orderdetails[0].refund_amount !== 0) {
             
                await Order.cod_create_refund_byonline(refundDetail);
                
               }
 
 
           }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
             var rc = new RefundCoupon(req);
             RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
               if (err) {
                 result(err, null);
               } 
             });
           }
           }
 
           if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
             removecoupon = {};
             removecoupon.userid = orderdetails[0].userid;
             removecoupon.cid = orderdetails[0].coupon;
             removecoupon.orderid = req.orderid;
             // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
             // await query(deletequery);
             await Order.remove_used_coupon(removecoupon);
           }
 
           await Notification.orderEatPushNotification(
             req.orderid,
             null,
             PushConstant.Pageid_eat_order_cancel
           );
           
           if(orderdetails[0]&&orderdetails[0].moveit_user_id){
             await Notification.orderMoveItPushNotification(
               req.orderid,
               PushConstant.pageidMoveit_Order_Cancel,
               null
             );
           }
           let response = {
             success: true,
             status: true,
             message: "Order canceled successfully."
           };
           result(null, response);
         }
       }
     );
   }
 };

 Order.admin_order_prepared_cancel = async function admin_order_prepared_cancel(req, result) {

  var cancel_reason=req.cancel_reason||""
   const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
 
   if (orderdetails[0].orderstatus == 7 ) {
     let response = {
       success: true,
       status: false,
       message: "Sorry! order already canceled."
     };
     result(null, response);
   }else if(orderdetails[0].orderstatus == 6){
       let response = {
         success: true,
         status: false,
         message: "Sorry! This order has been already deliverd."
       };
       result(null, response);
 
   } else {
    var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
     sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"',cancel_status = 1,cancel_time = '" +ordercanceltime+"'  WHERE orderid ='" +req.orderid +"'",async function(err, res) {
         if (err) {
           result(err, null);
         } else {
           var refundDetail = {
             orderid: req.orderid,
             original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
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
                 result(err, null);
               }
             });
           }
 
           if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {
 
             if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
               
               await Order.create_refund(refundDetail);
               if (orderdetails[0].refund_amount !== 0) {
              
                await Order.cod_create_refund_byonline(refundDetail);
                
               }
 
 
           }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
             var rc = new RefundCoupon(req);
             RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
               if (err) {
                 result(err, null);
               } 
             });
           }
           }
 
           if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
             removecoupon = {};
             removecoupon.userid = orderdetails[0].userid;
             removecoupon.cid = orderdetails[0].coupon;
             removecoupon.orderid = req.orderid;
             // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
             // await query(deletequery);
             await Order.remove_used_coupon(removecoupon);
           }
 
           await Notification.orderEatPushNotification(
             req.orderid,
             null,
             PushConstant.Pageid_eat_order_cancel
           );
           
           if(orderdetails[0]&&orderdetails[0].moveit_user_id){
             await Notification.orderMoveItPushNotification(
               req.orderid,
               PushConstant.pageidMoveit_Order_Cancel,
               null
             );
           }
           let response = {
             success: true,
             status: true,
             message: "Order canceled successfully."
           };
           result(null, response);
         }
       }
     );
   }
 };

 //Orders rating
Order.orders_rating = function orders_rating(req, result) {
  var pagelimt = 20;
  var page = req.page || 1;
  var date = req.date;
  var startlimit = (page - 1) * pagelimt;
  var ratingquery="Select * from Order_rating"
  if(date) ratingquery=ratingquery+" where Date(created_at) = "+date;
  var limtquery=ratingquery+" order by orid desc limit "+startlimit+"," +pagelimt;
  sql.query(limtquery,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var orderrating = await query(ratingquery);
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            totalcount:orderrating.length,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Virtual Kitchen Prepare After Cancel Report
Order.virtual_after_cancel = function virtual_after_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL) THEN makeit_earnings ELSE 0 END) as AfterCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '2019-10-14' AND  '2019-10-14') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL)) and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Real Kitchen Prepare After Cancel Report
Order.real_after_cancel = function real_after_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL) THEN makeit_earnings ELSE 0 END) as AfterCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL)) and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Virtual Kitchen Prepare Before Cancel Report
Order.virtual_before_cancel = function virtual_before_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NULL) THEN makeit_earnings ELSE 0 END) as BeforeCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NULL)) and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Real Kitchen Prepare Before Cancel Report
Order.real_before_cancel = function real_before_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NULL) THEN makeit_earnings ELSE 0 END) as BeforeCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NULL)) and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

<<<<<<< HEAD
//////////////Virtual Cancel Orders////////////////////
Order.virtual_order_canceled= function virtual_order_canceled(req, result) {
  sql.query("Select ord.orderid,ord.ordertype,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and m.virtualkey=1 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////////Real Cancel Orders/////////////////
Order.real_order_canceled= function real_order_canceled(req, result) {
  sql.query("Select ord.orderid,ord.ordertype,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id  where ord.orderstatus=7 and m.virtualkey=0 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Check Orders in queue 
Order.checkOrdersinQueue = function checkOrdersinQueue(req, result) {
  var query="Select count(*) ordercount from Orders as ors where ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( "+req.lat+" ) )  * cos( radians( "+req.lon+" ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians("+req.lat+")) ) )<2 and (ors.payment_type=0 or (ors.payment_type=1 and ors.payment_status<2))";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            ordercount:res[0].ordercount
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            status:true,
            ordercount:0
          };
          result(null, resobj);
        }
      }
    }
  );
=======

Order.auto_order_assign = function auto_order_assign(req, result) {

  
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");

  var geoLocation = [];;
  geoLocation.push(req.orglat);
  geoLocation.push(req.orglon);

  MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,constant.nearby_moveit_radius,async function(err, move_it_id_list) {
    if (err) {
      let error = {
        success: true,
        status: false,
        message:"No Move-it found,please after some time"
      };
      result(error, null);
    }else{
 
      
      var moveitlist = move_it_id_list.moveitid;
      
    if (moveitlist.length > 0) {
    //  console.log("moveitlist"+moveitlist.length);
      var moveitlistquery = ("select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN("+move_it_id_list.moveitid+") and mu.online_status = 1 and login_status=1 group by mu.userid");

      var nearbymoveit = await query(moveitlistquery);

      if (nearbymoveit.length !==0) {
        
        
        nearbymoveit.sort((a, b) => parseFloat(a.ordercout) - parseFloat(b.ordercout));
        
        console.log(nearbymoveit[0].userid);

      // sql.query("Select online_status,pushid_android,pushid_ios,login_status From MoveitUser where userid= '" +req.moveit_user_id +"' ",function(err, res1) {
      //   if (err) {
      //     result(err, null);
      //   } else {
      //     var online_status = res1[0].online_status;
      //     if (res1[0].login_status == 1) {
                   
      //     if (online_status == 1) {
            sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[nearbymoveit[0].userid, assign_time, req.orderid],async function(err, res2) {
                if (err) {
                  result(err, null);
                } else {
                  var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

                  await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned);
  
                  let resobj = {
                    success: true,
                    status:true,
                    message: "Order Assign Successfully",
                    
                  };
                  result(null, resobj);
               }
              }
            );
      //     } else {
      //       let resobj = {
      //         success: true,
      //         status: false,
      //         message: "Move it user is offline"
      //       };
      //       result(null, resobj);
      //     }
      //   }else if(res1[0].login_status == 2){
      //     let resobj = {
      //       success: true,
      //       status: false,
      //       message: "Please login"
      //   };
      
      //   result(null, resobj);
      //   }else if(res1[0].login_status == 3){
      //     let resobj = {
      //       success: true,
      //       status: false,
      //       message: "Please contact Administrator"
      //   };
      
      //   result(null, resobj);
      //   }
      //   }
      //  }
      // );

      }else{

        var new_Ordersqueue = new Ordersqueue(req);
      new_Ordersqueue.status = 0;
      Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
        if (err) { 
          result(err, null);
        }else{

          let resobj = {
            success: true,
            status: true,
            message: "Order moved to Queue"
        };
      
        result(null, resobj);
        }
      });
      }

    }else{

      var new_Ordersqueue = new Ordersqueue(req);
      new_Ordersqueue.status = 0;
      Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
        if (err) { 
          result(err, null);
        }else{

          let resobj = {
            success: true,
            status: true,
            message: "Order moved to Queue"
        };
      
        result(null, resobj);
        }
      });

    }
    }
  })
  
>>>>>>> eat
};

module.exports = Order;