"user strict";
var sql = require("../db.js");
const util = require("util");
var Orderitem = require("../../model/common/orderItemsModel.js");
var MoveitRatingForMakeit = require("../../model/moveit/moveitRatingForMakeitModel");
var Orderlock = require("../../model/common/lockorderModel");
var master = require("../master");
var constant = require("../constant.js");
var Makeituser = require("../../model/makeit/makeitUserModel.js");
var FCM = require("../../FcmSendNotification.js");
var constant = require("../constant.js");
var moment = require("moment");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: 'rzp_test_3cduMl5T89iR9G',
  key_secret: 'BSdpKV1M07sH9cucL5uzVnol'
})

const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Order = function(order) {
  this.userid = order.userid;
  // this.ordertime = moment().format('YYYY-MM-DD HH:mm:ss');
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
  //  this.moveit_status = order.moveit_status || '0';
  this.moveit_expected_delivered_time = order.moveit_expected_delivered_time;
  this.moveit_actual_delivered_time = order.moveit_actual_delivered_time;
  this.moveit_remarks_order = order.moveit_remarks_order;
  this.makeit_expected_preparing_time = order.makeit_expected_preparing_time;
  this.makeit_actual_preparing_time = order.makeit_actual_preparing_time;
  // this.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  this.price = order.price || 0;
  this.payment_status = order.payment_status || 0;
  this.cus_address = order.cus_address;
  this.lock_status = order.lock_status || 0;
};



Order.createOrder = async function createOrder(req, orderitems, result) {
  // console.log(req);
  try {
    var tempmessage = "";
    var newOrder = [];
    const productquantity = [];
    const delivery_charge = constant.deliverycharge;

    const res = await query(
      "select * from Orders where orderstatus < 6 and lock_status = 0 and userid= '" +
        req.userid +
        "'"
    );

    if (res.length == 0) {
      Makeituser.read_a_cartdetails_makeitid(req, orderitems, async function(
        err,
        res3
      ) {
        if (err) {
          result(err, null);
        } else {
          // console.log(res3.status);
          if (res3.status != true) {
            result(null, res3);
          } else {
            var amountdata = res3.result[0].amountdetails;
            req.gst = amountdata.gstcharge;
            req.price = amountdata.grandtotal;

            const res2 = await query(
              "Select * from Address where aid = '" + req.aid + "'"
            );
            // console.log(res2);
            req.cus_address = res2[0].address;
            req.locality = res2[0].locality;
            req.cus_lat = res2[0].lat;
            req.cus_lon = res2[0].lon;

            if (req.payment_type === 0) {
              ordercreatecashondelivery(req, res3.result[0].item);
              console.log("cash on delivery");
            } else if (req.payment_type === 1) {
              console.log("cash on online");
              ordercreatecashondelivery(req, res3.result[0].item);
            }
          }
        }
      });

      function ordercreatecashondelivery(req, orderitems) {
        console.log("ordercreatecashondelivery:");
        var new_Order = new Order(req);
        // new_Order.locality = 'guindy';
        //new_Order.orderstatus = 6;
        new_Order.delivery_charge = delivery_charge;

        console.log(new_Order);
        console.log(orderitems);
        sql.query("INSERT INTO Orders set ?", new_Order, function(err, res1) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
            var orderid = res1.insertId;

            for (var i = 0; i < orderitems.length; i++) {
              console.log(orderitems[i].productid);
              var orderitem = {};
              orderitem.orderid = orderid;
              orderitem.productid = orderitems[i].productid;
              orderitem.quantity = orderitems[i].cartquantity;
              orderitem.price = orderitems[i].price;
              var items = new Orderitem(orderitem);

              Orderitem.createOrderitems(items, function(err, res2) {
                if (err) result.send(err);
                //  console.log(res2);
              });
            }
            let sucobj = true;
            let status = true;
            let mesobj = "Order Created successfully";
            let resobj = {
              success: sucobj,
              status: status,
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
            result(null, err);
          } else {
            var orderid = res1.insertId;

            for (var i = 0; i < orderitems.length; i++) {
              var orderitemlock = new Orderlock(orderitems[i]);
              orderitemlock.orderid = orderid;

              var orderitem = new Orderitem(orderitems[i]);
              orderitem.orderid = orderid;

              Orderitem.createOrderitems(orderitem, function(
                err,
                orderitemresponce
              ) {
                if (err) result.send(err);
              });

              Orderlock.lockOrderitems(orderitemlock, function(
                err,
                orderitemresponce
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
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

Order.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from Orders where orderid = ? ", orderid, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from Orders", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Order : ", res);

      result(null, res);
    }
  });
};

Order.getAllVirtualOrder = function getAllVirtualOrder(result) {
  sql.query("Select * from Orders where virtual=0", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Order : ", res);

      result(null, res);
    }
  });
};

Order.updateById = function(id, user, result) {
  console.log("test");
  sql.query(
    "UPDATE Orders SET moveit_user_id = ? WHERE orderid = ?",
    [id, id],
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

Order.remove = function(id, result) {
  sql.query("DELETE FROM Orders WHERE orderid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
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

  //console.log(req);
  // Select * from Orders as ors left join User as us on ors.userid=us.userid where ors.moveit_user_id = 0
  //  var query = "select od.userid,us.name,od.ordertime,od.locality,od.delivery_charge,od.ordertype,od.orderstatus,od.gst,od.vocher,od.payment_type,od.makeit_user_id,od.moveit_user_id,od.cus_lat,od.cus_lon,od.cus_address,od.makeit_status,od.price,od.payment_status from Orders od join User us on od.userid = us.userid ";
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
  }else if (req.search) {
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
      console.log("error: ", err);
      result(null, err);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        totalcount = res2.length;

        let sucobj = true;
        let resobj = {
          success: sucobj,
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
  var startlimit = (page - 1) * orderlimit;

 
  var query =
    "Select * from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id";
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
    query = query + " where mk.virtualkey = '" + req.virtualkey + "'";
  }
  //var search= req.search
  if (req.virtualkey !== "all" && req.search) {
    query = query + " and (" + searchquery + ")";
  }else if (req.search) {
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
      console.log("error: ", err);
      result(null, err);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        totalcount = res2.length;

        let sucobj = true;
        let resobj = {
          success: sucobj,
          totalorder: totalcount,
          result: res1
        };

        result(null, resobj);
      });
    }
  });
};

Order.order_assign = function order_assign(req, result) {
  console.log("moveit_user_id-->" + req.moveit_user_id);
  sql.query(
    "Select online_status,pushid_android,pushid_ios From MoveitUser where userid= '" +
      req.moveit_user_id +
      "' ",
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res1);
        var online_status = res1[0].online_status;

        if (online_status == 1) {
          sql.query(
            "UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",
            [req.moveit_user_id, new Date(), req.orderid],
            function(err, res2) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                var pushid_android = res1[0].pushid_android;
                var pushid_ios = res1[0].pushid_ios;
                var push_title = "Order assign";
                var push_message = "Hi Order assigned.Order id #" + req.orderid;

                if (pushid_android)
                  FCM.sendSingleNotification(
                    pushid_android,
                    push_title,
                    push_message
                  );

                let sucobj = true;
                let message = "Order Assign Sucessfully";
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
          let message = "Move it user is offline";
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

Order.getUnassignorders = function getUnassignorders(result) {
  /// Select * from Orders as ors left join User as us on ors.userid=us .userid where ors.moveit_status = '0';
  // sql.query("Select * from Orders where moveit_status = '0' ", function (err, res) {
  sql.query(
    "Select * from Orders as ors left join User as us on ors.userid=us.userid where ors.moveit_user_id = 0 and ors.orderstatus < 2",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res);
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

// Order.orderlistbymoveituserid =  async function(moveit_user_id, result){

//   //  var query = "select * from Orders WHERE moveit_user_id  = '"+moveit_user_id+"'";

//       //  var query = "Select ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid where ors.moveit_user_id  = "+moveit_user_id+"";
//     // var query = "Select GROUP_CONCAT(ot.productid) as productid,GROUP_CONCAT(pt.product_name) as product_name,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id ="+moveit_user_id+"";
//        // var query = "Select GROUP_CONCAT('[',(CONCAT('{productid:', ot.productid, ', product_name:',pt.product_name,'}')),']') as products,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id = "+moveit_user_id+"";
//         //var query = "Select concat('[',GROUP_CONCAT(CONCAT('{\"productid\":\"', ot.productid, '\", \"product_name\":\"',pt.product_name,'\"}')),']') items,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id =10";
//        // var query = 'Select concat('[',GROUP_CONCAT(CONCAT('{\'productid\':\'', ot.productid, '\', \'product_name\':\'',pt.product_name,'\'}')),']') items,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id =10';
//        //var query = "Select concat('[',GROUP_CONCAT(CONCAT('{productid:', ot.productid, ', product_name:',pt.product_name,'}')),']') product,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id ="+moveit_user_id+"";

//         var query = "Select ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id ="+moveit_user_id+"";

//         sql.query(query, function (err, res) {

//          if(err) {
//              console.log("error: ", err);
//              result(null, err);
//          }
//          else{
//                 // var orders = res.map(x =>JSON.stringify(x));
//              for(var i= 0;i < res.length;i++){
//                  res[i].items = [];
//                  sql.query("Select ot.productid,pt.product_name from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = "+res[i].orderid+"", function (err, res1) {

//                      if(err) {
//                          console.log("error: ", err);
//                          result(null, err);
//                      }
//                      else{
//                           //if(res[i].items !== undefined)
//                           // res[i].items = res1|| [];

//                            console.log(res1);
//                          res.push(res1)
//                         //  let sucobj=true;
//                         //  let resobj = {
//                         //    success: sucobj,
//                         //    result: res
//                         //    };

//                         // result(null, resobj);

//                      }
//                  });

//              }

//              let sucobj=true;
//              let resobj = {
//                success: sucobj,
//                result: res
//                };

//             result(null, resobj);
//          }
//      });

// };

Order.orderviewbymoveituser = function(orderid, result) {
  // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
  sql.query(
    "select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" +
      orderid +
      "'",
    function(err, responce) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          res: responce
        };

        result(null, resobj);
      }
    }
  );
};

Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser(
  req,
  kitchenqualitylist,
  result
) {
  var date;
  date = new Date();
  date =
    date.getUTCFullYear() +
    "-" +
    ("00" + (date.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("00" + date.getUTCDate()).slice(-2) +
    " " +
    ("00" + date.getUTCHours()).slice(-2) +
    ":" +
    ("00" + date.getUTCMinutes()).slice(-2) +
    ":" +
    ("00" + date.getUTCSeconds()).slice(-2);

  var twentyMinutesLater = new Date();
  twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);

  twentyMinutesLater =
    twentyMinutesLater.getUTCFullYear() +
    "-" +
    ("00" + (twentyMinutesLater.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("00" + twentyMinutesLater.getUTCDate()).slice(-2) +
    " " +
    ("00" + twentyMinutesLater.getUTCHours()).slice(-2) +
    ":" +
    ("00" + twentyMinutesLater.getUTCMinutes()).slice(-2) +
    ":" +
    ("00" + twentyMinutesLater.getUTCSeconds()).slice(-2);

  sql.query("Select * from Orders where orderid = ?", [req.orderid], function(
    err,
    res1
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < kitchenqualitylist.length; i++) {
        var qualitylist = new MoveitRatingForMakeit(kitchenqualitylist[i]);
        qualitylist.orderid = req.orderid;
        qualitylist.makeit_userid = req.makeit_userid;
        qualitylist.moveit_userid = req.moveit_userid;

        MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck(
          qualitylist,
          function(err, res2) {
            if (err) result.send(err);
          }
        );
      }

      if (res1[0].moveit_user_id === req.moveit_userid) {
        //var query = "UPDATE Orders SET orderstatus = '"+req.orderstatus+"' ,moveit_reached_time = '"+new Date()+"',moveit_expected_delivered_time = '"+twentyMinutesLater+"' WHERE orderid = '"+req.orderid+"' and moveit_user_id ='"+req.moveit_userid+"'";
        // console.log(query);
        sql.query(
          "UPDATE Orders SET orderstatus = ? ,moveit_reached_time = ?,moveit_expected_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
          [
            req.orderstatus,
            new Date(),
            twentyMinutesLater,
            req.orderid,
            req.moveit_userid
          ],
          function(err, res2) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              let sucobj = true;
              let message = "Order Pickedup successfully";
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

Order.order_delivery_status_by_moveituser = function(req, result) {
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
              [req.orderstatus, new Date(), req.orderid, req.moveit_user_id],
              function(err, res) {
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
                    orderdeliverystatus: orderdeliverystatus
                  };

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
            message: message
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
  //  var query = "select * from Orders WHERE moveit_user_id  = '"+moveit_user_id+"'";

  //  var query = "Select ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid where ors.moveit_user_id  = "+moveit_user_id+"";
  // var query = "Select GROUP_CONCAT(ot.productid) as productid,GROUP_CONCAT(pt.product_name) as product_name,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id ="+moveit_user_id+"";
  // var query = "Select GROUP_CONCAT('[',(CONCAT('{productid:', ot.productid, ', product_name:',pt.product_name,'}')),']') as products,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id = "+moveit_user_id+"";
  //var query = "Select concat('[',GROUP_CONCAT(CONCAT('{\"productid\":\"', ot.productid, '\", \"product_name\":\"',pt.product_name,'\"}')),']') items,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id =10";
  // var query = 'Select concat('[',GROUP_CONCAT(CONCAT('{\'productid\':\'', ot.productid, '\', \'product_name\':\'',pt.product_name,'\'}')),']') items,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id =10';

  //      var query = "Select concat('[',GROUP_CONCAT(CONCAT('{productid:', ot.productid, ', product_name:',pt.product_name,'}')),']') product,ors.orderid,ors.userid,us.name,us.phoneno as cusphoneno,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone from Orders as ors join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid join OrderItem ot on ot.orderid = ors.orderid join Product pt on ot.productid=pt.productid where ors.moveit_user_id ="+moveit_user_id+" and ors.orderstatus =6 ";
  //      sql.query(query, function (err, res) {

  //       if(err) {
  //           console.log("error: ", err);
  //           result(null, err);
  //       }
  //       else{
  //              // var orders = res.map(x =>JSON.stringify(x));

  //         let sucobj=true;
  //         let resobj = {
  //           success: sucobj,
  //           result: res
  //           };

  //        result(null, resobj);
  //       }
  //   });

  try {
    const rows = await query(
      "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone,ms.userid as makeituserid,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id =" +
        moveit_user_id +
        " and ors.orderstatus = 6  order by ors.moveit_actual_delivered_time desc"
    );

    if (rows.length > 0) {
      console.log("Fetching No of Store Id", rows.length);
    } else {
      var res = {
        result: "Order is not found!"
      };
      result(null, res);
    }

    for (let i = 0; i < rows.length; i++) {
      var url =
        "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
        rows[i].orderid +
        "";

      let products = await query(url);

      rows[i].items = products;
    }
    let sucobj = true;
    let resobj = {
      success: sucobj,
      result: rows
    };

    result(null, resobj);
  } catch (err) {
    var errorCode = 402;

    result(null, errorCode);
  }
};

Order.orderlistbymoveituserid = async function(moveit_user_id, result) {
  try {
    const rows = await query(
      "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id =" +
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
  } catch (err) {
    var errorCode = 402;
    result(null, errorCode);
  }
};

Order.orderviewbyadmin = function(req, result) {
  console.log(req);
  // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
  sql.query(
    "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid ='" +
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
  sql.query(
    "select * from Orders where orderid =" + req.orderid + " ",
    function(err, res) {
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
            "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid =" +
              req.orderid +
              " ",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                for (let i = 0; i < res.length; i++) {
                  eta = 15 + 3 * res[i].distance;
                  //15min Food Preparation time , 3min 1 km
                  res[i].eta = Math.round(eta) + " mins";

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
                let status = true;
                let resobj = {
                  success: sucobj,
                  status: status,
                  result: res
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

Order.orderlistbyeatuser = async function(req, result) {
  var orderitem = [];

  sql.query(
    "select * from Orders where userid ='" +
      req.userid +
      "' and orderstatus = 6",
    function(err, res) {
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

          var query =
            "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where us.userid ='" +
            req.userid +
            "' and ors.orderstatus = 6 group by ors.orderid ";

          console.log(query);
          sql.query(query, async function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              for (let i = 0; i < res1.length; i++) {
                if (res1[i].userdetail) {
                  res1[i].userdetail = JSON.parse(res1[i].userdetail);
                }

                if (res1[i].makeitdetail) {
                  res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
                }
                if (res1[i].moveitdetail) {
                  res1[i].moveitdetail = JSON.parse(res1[i].moveitdetail);
                }

                if (res1[i].items) {
                  var items = JSON.parse(res1[i].items);
                  res1[i].items = items;
                }
              }

              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: true,
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



Order.online_order_place_conformation = function(order_place, result) {


  var transaction_time = moment().format('YYYY-MM-DD HH:mm:ss');

  if (order_place.payment_status === 1) {

    var query ="update Orders set payment_status = '" +order_place.payment_status + "', lock_status = 0,transactionid='" +order_place.transactionid + "',transaction_status= 'success', transaction_time= '"+transaction_time+"' WHERE orderid = '" +order_place.orderid +"' ";

    var orderdetailsquery ="SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid ='" +order_place.orderid +"'";

   // var deletequery = "delete from Lock_order where orderid ='"+order_place.orderid+"' ";

    sql.query(query, function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {

        // sql.query(deletequery, function(err, deleteres) {
        //   if (err) {
        //     console.log("error: ", err);
        //   } else {

            sql.query(orderdetailsquery, function(err, res2) {
              if (err) {
                console.log("error: ", err);
              } else {
                
                for (let i = 0; i < res2.length; i++) {
    
                  res2[i].distance = res2[i].distance.toFixed(2);
                  //15min Food Preparation time , 3min 1 km
                   var eta = 15 + 3 * res2[i].distance;
    
                  res2[i].eta = Math.round(eta) + " mins";
    
                  if (res2[i].userdetail) {
                    res2[i].userdetail = JSON.parse(res2[i].userdetail);
                  }
    
                  if (res2[i].makeitdetail) {
                    res2[i].makeitdetail = JSON.parse(res2[i].makeitdetail);
                  }
                  if (res2[i].moveitdetail) {
                    res2[i].moveitdetail = JSON.parse(res2[i].moveitdetail);
                  }
    
                  if (res2[i].items) {
                    var items = JSON.parse(res2[i].items);
                    res2[i].items = items.item;
                  }
                }
    
                let message = "Your order placed  successfully";
                let sucobj = true;
                let resobj = {
                  success: sucobj,
                  status:true,
                  message: message,
                  orderdetails: res2
                };
                result(null, resobj);
              }
            });

        //   }

        // });

       
      }
    });
  } else if(order_place.payment_status == 2){

    var query ="update Orders set payment_status = '" +order_place.payment_status + "',transactionid='" +order_place.transactionid + "',transaction_status= 'failed', transaction_time= '"+transaction_time+"' WHERE orderid = '" +order_place.orderid +"' ";
    
    var releasequantityquery = "select * from Lock_order where orderid ='"+order_place.orderid+"' ";
    

    sql.query(query, function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {

        sql.query(releasequantityquery, function(err, res2) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
    
                for (let i = 0; i < res2.length; i++) {
                  
                  var productquantityadd = "update Product set quantity = quantity+"+res2[i].quantity+" where productid ="+res2[i].productid+"";
                  
                  sql.query(productquantityadd, function(err, res2) {
                    if (err) {
                      console.log("error: ", err);
                      result(null, err);
                    } else {

                    
                    }
                  });
                }

                let sucobj = true;
                let message = "Sorry payment not yet be paid following order";
                let resobj = {
                  success: sucobj,
                  message: message,
                  status:false,
                  orderid: order_place.orderid
                };
                result(null, resobj);
          }
        });

      }
    });
    
   
  }

};


Order.live_order_list_byeatuserid = function live_order_list_byeatuserid(
  req,
  result
) {
  sql.query(
    "select * from Orders where userid ='" +
      req.userid +
      "' and orderstatus < 6 and lock_status = 0  ",
    function(err, res) {
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
          sql.query(
            "Select ors.orderid,ors.ordertime,ors.orderstatus,ors.price,ors.userid,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid ='" +
              req.userid +
              "' and ors.orderstatus < 6 and ors.lock_status = 0 ",
            function(err, res1) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                for (let i = 0; i < res1.length; i++) {
                  console.log(res1[i].ordertime);
                  var deliverytime = new Date(res1[i].ordertime);
                  console.log(deliverytime);
                  // d.setHours(d.getHours() + 5);
                  deliverytime.setMinutes(deliverytime.getMinutes() + 15);

                  console.log(deliverytime);

                  res1[i].deliverytime = deliverytime;

                  res1[i].distance = res1[i].distance.toFixed(2);
                  //15min Food Preparation time , 3min 1 km
                  eta = 15 + 3 * res1[i].distance;

                  res1[i].eta = Math.round(eta) + " mins";

                  if (res1[i].items) {
                    var items = JSON.parse(res1[i].items);
                    res1[i].items = items.item;
                  }
                }
                //FCM.sendSingleNotification('csXP3KaickY:APA91bGMhsUBtiwFfRb-qBqZY4dxCZSCVdf3aC9gqjMbKYzLqkfGAWsoJApi5YJNQ3DIM73eHqEnO48fYidD4Iba5smyhqzp5M0mXxKHjnZ-WoZHlBnNkbK8RyO5aXe_skxC8dPZcyDT','Order Post','Order Accepted');

                let sucobj = true;
                let resobj = {
                  success: sucobj,
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



Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(
  req,
  orderitems,
  result
) {
  try {
    console.log("read_a_proceed_to_pay: ");

    const delivery_charge = constant.deliverycharge;

    const res = await query(
      "select * from Orders where userid= '" +
      req.userid +
      "' and orderstatus < 6 or lock_status != 0 and payment_status !=1 "
    );

    if (res.length == 0) {
      Makeituser.read_a_cartdetails_makeitid(req, orderitems, async function(
        err,
        res3
      ) {
        if (err) {
          result(err, null);
        } else {
          console.log(res3.status);
          if (res3.status != true) {
            result(null, res3);
          } else {
            var amountdata = res3.result[0].amountdetails;
            req.gst = amountdata.gstcharge;
            req.price = amountdata.grandtotal;

            const res2 = await query(
              "Select * from Address where aid = '" +
                req.aid +
                "' and userid = '" +
                req.userid +
                "'"
            );
          
             
            req.cus_address = res2[0].address;
            req.locality = res2[0].locality;
            req.cus_lat = res2[0].lat;
            req.cus_lon = res2[0].lon;


            var  makeitavailability = await query("Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img as makeitimg,ly.localityname,( 3959 * acos( cos( radians("+res2[0].lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+res2[0].lon+") ) + sin( radians("+res2[0].lat+") ) * sin(radians(mk.lat)) ) ) AS distance from MakeitUser mk left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  where mk.userid =83 and mk.appointment_status = 3 and mk.verified_status = 1");

            var eta = 15 + (3 * makeitavailability[0].distance) ;
            //15min Food Preparation time , 3min 1 km 
              
            if (makeitavailability[0].distance <= 6 && eta <= 60 ) {
              
            
            var distancetime =   Math.round(eta) +"mins" ;  
         
            console.log(makeitavailability[0].distance);
            console.log(distancetime);

            if (req.payment_type === 0) {
              console.log("cash on delivery");
              ordercreatecashondelivery(req, res3.result[0].item);
            } else if (req.payment_type === 1) {
              console.log("cash on online");
              ordercreateonline(req, res3.result[0].item);
            }
          }else{

            let sucobj = true;
            let status = false;
            let mesobj =
              "Sorry This kitchen service is not available! for following address";
            let resobj = {
              success: sucobj,
              status: status,
              message: mesobj
            };
            result(null, resobj);

          }
          }
        }
      });

      function ordercreatecashondelivery(req, orderitems) {
        console.log("ordercreatecashondelivery: ");
        var new_Order = new Order(req);

        new_Order.delivery_charge = delivery_charge;
        sql.query("INSERT INTO Orders set ?", new_Order, function(err, res1) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
            var orderid = res1.insertId;

            for (var i = 0; i < orderitems.length; i++) {
              console.log(orderitems[i].productid);
              var orderitem = {};
              orderitem.orderid = orderid;
              orderitem.productid = orderitems[i].productid;
              orderitem.quantity = orderitems[i].cartquantity;
              orderitem.price = orderitems[i].price;
              var items = new Orderitem(orderitem);

              Orderitem.createOrderitems(items, function(err, res2) {
                if (err) result.send(err);
              });
            }
            PushNotification(req.userid, orderid);
            let sucobj = true;
            let status = true;
            let mesobj = "Order Created successfully";
            let resobj = {
              success: sucobj,
              status: status,
              message: mesobj,
              orderid: orderid
            };
            result(null, resobj);
          }
        });
      }


     async function ordercreateonline(req, orderitems) {
   
        const userinfo = await query("Select * from User where userid = '" +req.userid +"'");

        var customerid = userinfo[0].razer_customerid

        if (!userinfo[0].razer_customerid) {
          
        var customerid = await Order.create_customerid_by_razorpay(userinfo);
        console.log("customerid:----- ", customerid); 
        if (!customerid) {
            let resobj = {
              success: true,
              status: false,
              message: "Sorry can't create the order due to customerid not yet generate"
              
            };
          result(null,resobj );
          return
        }
        }


        var new_Order = new Order(req);
        new_Order.delivery_charge = delivery_charge;
        new_Order.lock_status = 1;
  
        
        sql.query("INSERT INTO Orders set ?", new_Order, async function(err, res1) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {

            var orderid = res1.insertId;

            for (var i = 0; i < orderitems.length; i++) {
              console.log(orderitems[i].productid);
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
                if (err) 
                result.send(err);
              });

              
              Orderlock.lockOrderitems(orderitemlock, function (err, orderlockresponce) {
                        if (err)
                        result.send(err);
                     });
              }



            let mesobj = "Order Created successfully";
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: true,
              message:mesobj,
              price:new_Order.price,
              razer_customerid:customerid,
              orderid: orderid
            };

            result(null, resobj);
          }
        });
      }
    
      function PushNotification(userid, orderid) {
        sql.query("SELECT * FROM User where userid = " + userid, function(
          err,
          user
        ) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
            var pushid_android = user[0].pushid_android;
            var pushid_ios = user[0].pushid_ios;
            var push_title = "Order Accepted";
            var push_message =
              "Hi! your Order accepted. your Order id #" + orderid;
            if (pushid_android)
              FCM.sendOrderNotificationAndroid(
                pushid_android,
                push_title,
                push_message
              );
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
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};


Order.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userinfo) { 
 
  
  var name = userinfo[0].name;
  var email = userinfo[0].email;
  var contact = userinfo[0].phoneno;
  var notes = "eatuser";
  var cuId=false;

  return await instance.customers.create({name, email, contact, notes}).then((data) => {
    cuId=data.id;
    //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
   
      sql.query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + userinfo[0].userid +" ", function(err, customerupdate) {
       if (err) {
        console.log("error: ", err);
        //  return false;
       } 
      });
      console.log("cuId:----- ", cuId);
      return cuId;
      }).catch((error) => {
        console.log("error: ", error);
        return false;
      })

     
     


};




module.exports = Order;
