"user strict";
var sql = require("../db.js");
const CronJob = require("cron").CronJob;
const util = require("util");
var moment = require("moment");
var constant = require("../constant");
var producthistory = require("../../model/makeit/liveproducthistoryModel.js");
var MoveitFireBase = require("../../push/Moveit_SendNotification");
var Ordersqueue = require("../../model/common/ordersqueueModel");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");
var isCronRun=false;
var Order = require("../../model/common/orderModel.js");
var OrderStatusHistory = require("../common/orderstatushistoryModel");
var Dunzo = require("../../model/webhooks/dunzoModel.js");
var dunzoconst = require('../../model/dunzo_constant');
var PackageStockInventory = require('../makeit/packageStockModel');
var kpiproducthistory = require("../makeit/kpiproducthistoryModel.js");
var Moveituser = require("../moveit/moveitUserModel.js");
var MoveitDayWise = require("../../model/common/moveitdaywiseModel.js");
var MakeitDayWise = require("../../model/common/makeitdaywiseModel.js");
var Makeitlog =require("../../model/common/makeittimelogModel.js");
var Makeittotalrevenue = require("../../model/common/MakeittotalrevenueModel");


const query = util.promisify(sql.query).bind(sql);
var QuickSearch   = function(QuickSearch) {
  this.eatuserid  = QuickSearch.eatuserid;
  this.productid  = QuickSearch.productid || 0;
  this.makeit_userid = QuickSearch.makeit_userid || 0;
};

QuickSearch.eat_explore_store_data_by_cron = async function eat_explore_store_data_by_cron(search, result) {
  const quicksearchquery = await query("Select * from QuickSearch");
  if (quicksearchquery.err) {
    let resobj = {
      success: sucobj,
      status: false,
      result: err
    };
    result(null, resobj);
  } else {
    if (quicksearchquery) {
      const truncatequery = await query("truncate QuickSearch");
      if (truncatequery.err) {
        let resobj = {
          success: sucobj,
          status: false,
          result: err
        };
        result(null, resobj);
      }
    }

    var breatfastcycle = constant.breatfastcycle;
    var dinnercycle = constant.dinnercycle;
    var lunchcycle = constant.lunchcycle;
    var day = moment().format("YYYY-MM-DD HH:mm:ss");
    var currenthour = moment(day).format("HH");
    var cyclequery = "";
    if (currenthour < lunchcycle) {
      cyclequery = cyclequery + " and pt.breakfast = 1";
    } else if (currenthour >= lunchcycle && currenthour <= dinnercycle) {
      cyclequery = cyclequery + " and pt.lunch = 1";
    } else if (currenthour >= dinnercycle) {
      cyclequery = cyclequery + " and pt.dinner = 1";
    }

    //  const productquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct product_name as name,productid as id, 1 from Product where product_name IS NOT NULL group by product_name");
    var productquery = await query(
      "INSERT INTO QuickSearch (name,id, type) SELECT distinct pt.product_name as name,pt.productid as id, 1 from Product pt join MakeitUser mk on mk.userid = pt.makeit_userid where (pt.product_name IS NOT NULL and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 " +
        cyclequery +
        ")and(mk.appointment_status = 3 and mk.verified_status = 1 and ka_status = 2)  group by pt.product_name"
    );
    if (productquery.err) {
      let resobj = {
        success: sucobj,
        status: false,
        result: err
      };
      result(null, resobj);
    } else {
      //  const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1");
      // const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 group by mk.userid");
      const kitchenquery = await query(
        "INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 " +
          cyclequery +
          ") group by mk.userid"
      );
      if (kitchenquery.err) {
        let resobj = {
          success: sucobj,
          status: false,
          result: err
        };
        result(null, resobj);
      } else {
        //  const regionquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionname IS NOT NULL group by regionname");
        const regionquery = await query(
          "INSERT INTO QuickSearch (name,id, type)  SELECT distinct regionname as name,regionid as id, 3 from Region where regionid IN (SELECT  mk.regionid from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid  where  mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 " +
            cyclequery +
            " ) group by mk.regionid )  and regionname IS NOT NULL  group by regionid"
        );
        if (regionquery.err) {
          let resobj = {
            success: sucobj,
            status: false,
            result: err
          };
          result(null, resobj);
        } else {
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true,
            message: "Quick search updated"
          };
          result(null, resobj);
        }
      }
    }
  }
};

// This cron is to running all region and product and makeit to quick search  console.log('Before job instantiation');
const job = new CronJob("0 */10 * * * *", async function(search, result) {
  sql.query("Select * from QuickSearch", function(err, res) {
    if (err) {
      console.log("error: ", err);
      //result(err, null);
    } else {
      sql.query("truncate QuickSearch", async function(err, res1) {
        if (err) {
          console.log("error: ", err);
          //  result(err, null);
        } else {
          var breatfastcycle = constant.breatfastcycle;
          var dinnercycle = constant.dinnercycle;
          var lunchcycle = constant.lunchcycle;
          var day = moment().format("YYYY-MM-DD HH:mm:ss");
          var currenthour = moment(day).format("HH");
          var cyclequery = "";
          if (currenthour < lunchcycle) {
            cyclequery = cyclequery + " and pt.breakfast = 1";
          } else if (currenthour >= lunchcycle && currenthour <= dinnercycle) {
            cyclequery = cyclequery + " and pt.lunch = 1";
          } else if (currenthour >= dinnercycle) {
            cyclequery = cyclequery + " and pt.dinner = 1";
          }
          const proquery = await query(
            "INSERT INTO QuickSearch (name,id, type) SELECT distinct pt.product_name as name,pt.productid as id, 1 from Product pt join MakeitUser mk on mk.userid = pt.makeit_userid where (pt.product_name IS NOT NULL and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1)and(mk.appointment_status = 3 and mk.verified_status = 1 and ka_status = 2)  group by pt.product_name"
          );
          const kitchenquery = await query(
            "INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 " +
              cyclequery +
              ") group by mk.userid"
          );
          const regionquery = await query(
            "INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionid IN (SELECT  mk.regionid from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid  where  mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 " +
              cyclequery +
              " ) group by mk.regionid ) and regionname IS NOT NULL  group by regionid"
          );
        }
      });
    }
  });
});
//job.start();

//incomplete online and release product quantity and order release by user.
const job1 = new CronJob("*/3 * * * *", async function() {
  var res = await query(
    "select * from Orders where lock_status = 1 and payment_type = 1 and orderstatus = 0 "
  ); //and created_at > (NOW() - INTERVAL 10 MINUTE
  // console.log("cron for product revert online orders in-complete orders"+res);
  if (res.length !== 0) {
    for (let i = 0; i < res.length; i++) {
      var today = moment();
      var ordertime = moment(res[i].ordertime);
      var diffMs = today - ordertime;
      var diffDays = Math.floor(diffMs / 86400000);
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
      console.log(diffMins);
      ///Online payment unsucesssfull orders above 30 min to revert to poduct and cancel that order
      if (diffMins > 30) {
        var lockres = await query(
          "select * from Lock_order where orderid ='" + res[i].orderid + "' "
        );
        if (lockres.length !== 0) {
          for (let j = 0; j < lockres.length; j++) {
            var productquantityadd = await query(
              "update Product set quantity = quantity+" +
                lockres[j].quantity +
                " where productid =" +
                lockres[j].productid +
                ""
            );
            var updatequery = await query(
              "update Orders set orderstatus = 9,payment_status= 2 where orderid = '" +
                res[i].orderid +
                "'"
            );
            ////Insert Order History////            
            ////////////////////////////
          }
        }
      }
    }
  }
});
//job1.start();

QuickSearch.eat_explore_quick_search = function eat_explore_quick_search(req, result) {
  // var searchquery = "select *, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%"+req.search+"%'";
  var searchquery =
    "select searchid,id,name,type, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%" +
    req.search +
    "%'";
  sql.query(searchquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        if (res[i].type == 1) {
        }
      }
      let resobj = {
        success: true,
        status: true,
        result: res
      };
      result(null, resobj);
    }
  });
};

///// Cron For BreakFast, Lunch, Dinner Every Cycle Start and End ///////////
const liveproducthistory = new CronJob("0 0 8,12,16,23 * * *", async function(
  req,
  result
) {
  var breatfastcycle = constant.breatfastcycle;
  var lunchcycle = constant.lunchcycle;
  var dinnercyclestart = constant.dinnercycle;
  var dinnercycle = constant.dinnerend + 1; //22+1
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour = moment(day).format("HH");
  var CSselectquery = "";
  var CSwherequery = "";
  var CEselectquery = "";
  var CEwherequery = "";
  var cyclestart = 0;
  var cycleend = 0;

  if (currenthour == breatfastcycle) {
    cyclestart = 1;
    CSselectquery = " 3 as action,"; /////// Cycle Start ////
    CSwherequery = " and prd.breakfast=1";
  } else if (currenthour == lunchcycle) {
    cycleend = 1;
    cyclestart = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery = " and prd.breakfast=1";
    CSselectquery = " 3 as action,"; ////// Cycle Start ////
    CSwherequery = " and prd.lunch=1";
  } else if (currenthour == dinnercyclestart) {
    cycleend = 1;
    cyclestart = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery = " and prd.lunch=1";
    CSselectquery = " 3 as action,"; ////// Cycle Start ////
    CSwherequery = " and prd.dinner=1";
  } else if (currenthour == dinnercycle) {
    cycleend = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery = " and prd.dinner=1";
  } else {
  }

  if (breatfastcycle && lunchcycle && dinnercycle) {
    if (cyclestart == 1) {
      const getproductdetailscs = await query(
        "select" +
          CSselectquery +
          " prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN IFNULL(oi.quantity,0) ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 and payment_status<2 THEN IFNULL(oi.quantity,0) ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 " +
          CSwherequery +
          " group by prd.productid"
      );
      if (getproductdetailscs.err) {
        //result(err, null);
        console.log(getproductdetailscs.err);
      } else {
        for (var i = 0; i < getproductdetailscs.length; i++) {
          var inserthistory = await producthistory.createProducthistory(
            getproductdetailscs[i]
          );
        }
      }
    }
    if (cycleend == 1) {
      const getproductdetailsce = await query(
        "select" +
          CEselectquery +
          " prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN IFNULL(oi.quantity,0) ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 and payment_status<2 THEN IFNULL(oi.quantity,0) ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 " +
          CEwherequery +
          " group by prd.productid"
      );
      if (getproductdetailsce.err) {
        //result(err, null);
        console.log(getproductdetailsce.err);
      } else {
        for (var i = 0; i < getproductdetailsce.length; i++) {
          var inserthistory = await producthistory.createProducthistory(
            getproductdetailsce[i]
          );
        }
      }
    }
  }
});
//liveproducthistory.start();

//cron run by moveit user offline every night 2 AM.
const job1moveitlogout = new CronJob("0 0 2 * * *", async function() {
  console.log("moveit offline");
  var res = await query(
    "select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1"
  ); //and created_at > (NOW() - INTERVAL 10 MINUTE
  //select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1
  //select * from MoveitUser where online_status = 1 and login_status = 1
  // console.log("cron for product revert online orders in-complete orders"+res);
  if (res.length !== 0) {
    for (let i = 0; i < res.length; i++) {
      var moveit_offline_query = await query(
        "update MoveitUser set online_status = 0 where userid =" +
          res[i].userid +
          ""
      );

      /////////Insert Moveit-Time log/////////////////
      var req={};
      req.type  = 0;
      req.moveit_userid = res[i].userid;
      await Moveituser.create_createMoveitTimelog(req);

      //  var today = moment();
      //  var ordertime = moment(res[i].ordertime);
      //  var diffMs  = (today - ordertime);
      //  var diffDays = Math.floor(diffMs / 86400000);
      //  var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      //  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    }
  }
});
//job1moveitlogout.start();

// const order_auto_assign = new CronJob("1 7-23 * * * ", async function() {
//   console.log("order_auto_assign");
//   var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
//   var res = await query(
//     "select oq.*,mk.makeithub_id,mk.userid,mk.lat,mk.lon from Orders_queue as oq join Orders as ors on ors.orderid=oq.orderid join MakeitUser as mk on mk.userid = ors.makeit_user_id where status = 0  order by oq.orderid desc"
//   ); //and created_at > (NOW() - INTERVAL 10 MINUTE

//   // console.log("cron for product revert online orders in-complete orders"+res);
//   if (res.length !== 0) {
//     for (let i = 0; i < res.length; i++) {
//       var geoLocation = [];
//       geoLocation.push(res[i].lat);
//       geoLocation.push(res[i].lon);
//       MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(
//         geoLocation,
//         constant.nearby_moveit_radius,
//         async function(err, move_it_id_list) {
//           if (err) {
//             let error = {
//               success: true,
//               status: false,
//               message: "No Move-it found,please after some time"
//             };
//             result(error, null);
//           } else {
//             var moveitlist = move_it_id_list.moveitid;

//             if (moveitlist.length > 0) {
//               //  console.log("moveitlist"+moveitlist.length);
//               var moveitlistquery =
//                 "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
//                 move_it_id_list.moveitid +
//                 ") and mu.online_status = 1 and login_status=1 group by mu.userid";

//               var nearbymoveit = await query(moveitlistquery);

//               if (nearbymoveit.length !== 0) {
//                 nearbymoveit.sort(
//                   (a, b) => parseFloat(a.ordercout) - parseFloat(b.ordercout)
//                 );

//                 sql.query(
//                   "UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",
//                   [nearbymoveit[0].userid, assign_time, res[i].orderid],
//                   async function(err, res2) {
//                     if (err) {
//                       result(err, null);
//                     } else {
//                       var moveit_offline_query = await query(
//                         "update Orders_queue set status = 1 where orderid =" +
//                           res[i].orderid +
//                           ""
//                       );

//                       await Notification.orderMoveItPushNotification(
//                         res[i].orderid,
//                         PushConstant.pageidMoveit_Order_Assigned
//                       );

//                       // let resobj = {
//                       //   success: true,
//                       //   status:true,
//                       //   message: "Order Assign Successfully",

//                       // };
//                       // result(null, resobj);
//                     }
//                   }
//                 );
//               }
//               // else{

//               // var new_Ordersqueue = new Ordersqueue(req);
//               // new_Ordersqueue.status = 0;
//               // Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
//               //   if (err) {
//               //     result(err, null);
//               //   }else{

//               //   //   let resobj = {
//               //   //     success: true,
//               //   //     status: true,
//               //   //     message: "Order moved to Queue"
//               //   // };

//               //   // result(null, resobj);
//               //   }
//               // });
//               // }
//             }
//             // else{

//             //   var new_Ordersqueue = new Ordersqueue(req);
//             //   new_Ordersqueue.status = 0;
//             //   Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
//             //     if (err) {
//             //       result(err, null);
//             //     }else{

//             //     //   let resobj = {
//             //     //     success: true,
//             //     //     status: true,
//             //     //     message: "Order moved to Queue"
//             //     // };

//             //     // result(null, resobj);
//             //     }
//             //   });

//             // }
//           }
//         }
//       );

//       //  var today = moment();
//       //  var ordertime = moment(res[i].ordertime);
//       //  var diffMs  = (today - ordertime);
//       //  var diffDays = Math.floor(diffMs / 86400000);
//       //  var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
//       //  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
//     }
//   }
// });


//dunzo_task_create
QuickSearch.dunzo_task_create = function dunzo_task_create(orderid) {

  Dunzo.dunzo_task_create(orderid, function(err, res) {
    if (err) return err;
    else return res;
  });
};

const order_auto_assign_Change = new CronJob("* */1 7-23 * * * ", async function() {
  if (constant.order_assign_status==true) {
  var i = 0;
  // var res = await query(
  //   "select oq.*,mk.makeithub_id,mk.userid,mk.lat,mk.pincode,mk.lon,ors.makeit_accept_time,ors.payment_type from Orders_queue as oq join Orders as ors on ors.orderid=oq.orderid join MakeitUser as mk on mk.userid = ors.makeit_user_id where oq.status !=1  and ors.orderstatus < 6  order by ors.ordertime ASC"
  // ); //and created_at > (NOW() - INTERVAL 10 MINUTE

  var res = await query("select oq.*,zo.zone_status,mk.makeithub_id,mk.userid,mk.lat,mk.pincode,mk.lon,ors.makeit_accept_time,ors.payment_type, ors.price from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid left join MakeitUser as mk on mk.userid = ors.makeit_user_id left join Zone as zo on zo.id=mk.zone where oq.status !=1 and ors.orderstatus < 6 and ors.dunzo_taskid IS NULL order by ors.ordertime ASC");
  console.log('res length-->',res.length);
  console.log('isCronRun-->',isCronRun);
  if (res.length !== 0&&!isCronRun) {
    
    ////Start: Zone Based Order Assign //////////////
    
   //   res.sort((a, b) => parseFloat(a.payment_type) - parseFloat(b.payment_type));
   
    if(constant.zone_control){
      QuickSearch.Zone_order_assign(res,i);
    }else{
      QuickSearch.order_assign(res,i);
    }
    ////End: Zone Based Order Assign ////////////// 
  }
  }
});

//cancel orders
QuickSearch.admin_order_cancel = function admin_order_cancel(order_cancel) {
  Order.admin_order_cancel(order_cancel, function(err, res) {
    if (err) return err;
    else return res;
  });
};

// QuickSearch.order_assign=async function order_assign(res,i){
//   try{
//   const delay = ms => new Promise(res => setTimeout(res, ms))
//   isCronRun=true;
//   console.log('i id-->',i)
//   console.log('i res.length-->',res.length)
//   var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
//   if (i<res.length) {
//     //for (let i = 0; i < res.length; i++) {

//     //dunzo code
//     var today = moment();
//     var makeit_accept_time = moment(res[i].makeit_accept_time);
//     var diffMs = today - makeit_accept_time;
//     // var diffDays = Math.floor(diffMs / 86400000);
//     // var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
//     var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

//     var order_queue_update_time = moment(res[i].updated_at);
//     var order_queue_diffMs = today - order_queue_update_time;

//     var order_queue_diffMins = Math.round(((order_queue_diffMs % 86400000) % 3600000) / 60000);
    
//     console.log("order_queue_diffMins"+order_queue_diffMins);
//     console.log("res[i].dunzo_req_count"+res[i].dunzo_req_count);
//     console.log("diffMins"+diffMins);
//     console.log("res[i].payment_type"+res[i].payment_type);
//     console.log("res[i].status"+res[i].status);
 
//   if (dunzoconst.order_assign_dunzo==true  && diffMins >= dunzoconst.order_assign_dunzo_waiting_min && res[i].status == 0 ) {  
//        // Dunzo.dunzo_task_create
//        console.log("Dunzo.dunzo_task_create");
//       //  await QuickSearch.dunzo_task_create(res[i].orderid);
//       //  i++;
//       //  order_assign(res,i);
//       Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
//         if (err) {
//           i++;
//           order_assign(res,i);
//         } else {
//           i++;
//           order_assign(res,i);
          
//         }
//       });
//   }else if(res[i].zone_status == 2 && order_queue_diffMins >1 && res[i].status !=1 ){
//     console.log("Dunzo xone dunzo_task_create");
//       if (res[i].dunzo_req_count >= constant.Dunzo_max_req) {
//         var order_cancel={};
//         order_cancel.orderid = res[i].orderid;
//         order_cancel.cancel_reason ='Dunzo failure to generate task id';
//         await QuickSearch.admin_order_cancel(order_cancel);
//         i++;
//         order_assign(res,i);
//       } else {
//         Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
//           if (err) {
//             i++;
//             order_assign(res,i);
//           } else {
//             i++;
//             order_assign(res,i);
            
//           }
//         });
//       }
      
//   }else{

//         var radius = constant.order_assign_first_radius + constant.order_assign_second_radius;
//         var geoLocation = [];
//         geoLocation.push(res[i].lat);
//         geoLocation.push(res[i].lon);
//         MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,radius,async function(err, move_it_id_list) {
//             if (err) {
//               let error = {
//                 success: true,
//                 status: false,
//                 message: "No Move-it found,please after some time"
//               };
//               console.log('Geo error->',err);
//               i++;
//               order_assign(res,i);
//             } else {
//               console.log("move_it_id_list.moveitid_below_2",move_it_id_list.moveitid_below_2);
//               console.log("move_it_id_list.moveitid_above_2",move_it_id_list.moveitid_above_2);
//               var nearbymoveit = [];
              
//          //     if (move_it_id_list.moveitid_below_2) {

//             var get_zoneid = await query("select mk.zone from Orders ors join MakeitUser mk on ors.makeit_user_id=mk.userid where ors.orderid='"+res[i].orderid+"' ");
               

//                 if (move_it_id_list.moveitid_below_2) {
            
//                   var moveitlistquery =
//                     "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
//                     move_it_id_list.moveitid_below_2 +
//                     ") and mu.online_status = 1 and login_status=1  and mu.zone = "+get_zoneid[0].zone+" group by mu.userid order by ordercount";
//                      nearbymoveit = await query(moveitlistquery);

//                 }
                
//                 if(move_it_id_list.moveitid_above_2 && nearbymoveit.length ==0){
  
//                   var moveitlistquery =
//                     "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
//                     move_it_id_list.moveitid_above_2 +
//                     ") and mu.online_status = 1 and login_status=1 and mu.zone = "+get_zoneid[0].zone+" group by mu.userid order by ordercount";
//                     nearbymoveit = await query(moveitlistquery);
//                 }
  
//                   if (nearbymoveit.length !== 0) {
//                   // nearbymoveit.sort(
//                   //   (a, b) => parseFloat(a.ordercout) - parseFloat(b.ordercout)
//                   // );
//                   console.log('nearbymoveit id-->',nearbymoveit[0].userid);
//                   sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[nearbymoveit[0].userid, assign_time, res[i].orderid],async function(err, res2) {
//                       if (err) {
//                          console.log('Order Update error->',err);
//                         i++;
//                         order_assign(res,i);
//                       } else {
//                         var moveit_offline_query = await query(
//                           "update Orders_queue set status = 1 where orderid =" +
//                             res[i].orderid +
//                             ""
//                         );
//                          var req={};
//                         req.state=1;
//                         req.moveit_user_id=nearbymoveit[0].userid;
//                         Order.update_moveit_lat_long(req);
//                         await Notification.orderMoveItPushNotification(
//                           res[i].orderid,
//                           PushConstant.pageidMoveit_Order_Assigned
//                         );
//                        // delay(1000);
//                        i++;
//                        order_assign(res,i);
//                       }
//                     }
//                   );
//                 }else{
//                   i++;
//                   order_assign(res,i);
//                 }
//               // }else{
//               //   i++;
//               //   order_assign(res,i);
    
//               // }
//             }
//           }
//         );

//   }
//   }else{
//     isCronRun=false;
//   }
// }catch(e){
//   console.log("e--->",e);
//   isCronRun=false;
// }

// };

QuickSearch.order_assign=async function order_assign(res,i){
  try{
  const delay = ms => new Promise(res => setTimeout(res, ms))
  isCronRun=true;
  console.log('i id-->',i)
  console.log('i res.length-->',res.length)
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
  if (i<res.length) {
    //for (let i = 0; i < res.length; i++) {

    //dunzo code
    var today = moment();
    var makeit_accept_time = moment(res[i].makeit_accept_time);
    var diffMs = today - makeit_accept_time;
    // var diffDays = Math.floor(diffMs / 86400000);
    // var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    var order_queue_update_time = moment(res[i].updated_at);
    var order_queue_diffMs = today - order_queue_update_time;

    var order_queue_diffMins = Math.round(((order_queue_diffMs % 86400000) % 3600000) / 60000);
    
    console.log("order_queue_diffMins"+order_queue_diffMins);
    console.log("res[i].dunzo_req_count"+res[i].dunzo_req_count);
    console.log("diffMins"+diffMins);
    console.log("res[i].payment_type"+res[i].payment_type);
    console.log("res[i].status"+res[i].status);
 
  if (dunzoconst.order_assign_dunzo==true  && diffMins >= dunzoconst.order_assign_dunzo_waiting_min && res[i].status == 0 ) {  
       // Dunzo.dunzo_task_create
       console.log("Dunzo.dunzo_task_create");
      //  await QuickSearch.dunzo_task_create(res[i].orderid);
      //  i++;
      //  order_assign(res,i);
      Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
        if (err) {
          i++;
          order_assign(res,i);
        } else {
          i++;
          order_assign(res,i);
          
        }
      });
  }else if(res[i].zone_status == 2 && order_queue_diffMins >1 && res[i].status !=1 ){
    console.log("Dunzo xone dunzo_task_create");
      if (res[i].dunzo_req_count >= constant.Dunzo_max_req) {
        var order_cancel={};
        order_cancel.orderid = res[i].orderid;
        order_cancel.cancel_reason ='Dunzo failure to generate task id';
        await QuickSearch.admin_order_cancel(order_cancel);
        i++;
        order_assign(res,i);
      } else {
        Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
          if (err) {
            i++;
            order_assign(res,i);
          } else {
            i++;
            order_assign(res,i);
            
          }
        });
      }
      
  }else{

        var radius = constant.order_assign_first_radius + constant.order_assign_second_radius;
        var geoLocation = [];
        geoLocation.push(res[i].lat);
        geoLocation.push(res[i].lon);
        MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,radius,async function(err, move_it_id_list) {
            if (err) {
              let error = {
                success: true,
                status: false,
                message: "No Move-it found,please after some time"
              };
              console.log('Geo error->',err);
              i++;
              order_assign(res,i);
            } else {
            
              var near_by_moveit_data = [];
              move_it_id_list.sort(
                    (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
                  );

              for (let i = 0; i < move_it_id_list.length; i++) {
              
                
                near_by_moveit_data.push(move_it_id_list[i].moveit_id);
              }
                  console.log("move_it_id_list",move_it_id_list);
                  console.log("move_it_id_list",move_it_id_list.length);
           //   console.log("move_it_id_list.moveitid_above_2",move_it_id_list.moveitid_above_2);
              var nearbymoveit = [];
              
         //     if (move_it_id_list.moveitid_below_2) {

            var get_zoneid = await query("select mk.zone from Orders ors join MakeitUser mk on ors.makeit_user_id=mk.userid where ors.orderid='"+res[i].orderid+"' ");
               

                // if (move_it_id_list.moveitid_below_2) {
            
                //   var moveitlistquery =
                //     "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
                //     move_it_id_list.moveitid_below_2 +
                //     ") and mu.online_status = 1 and login_status=1  and mu.zone = "+get_zoneid[0].zone+" group by mu.userid order by ordercount";
                //      nearbymoveit = await query(moveitlistquery);

                // }
                
                // if(move_it_id_list.moveitid_above_2 && nearbymoveit.length ==0){
  
                  var moveitlistquery =
                    "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
                    near_by_moveit_data +
                    ") and mu.online_status = 1 and login_status=1 and mu.zone = "+get_zoneid[0].zone+" group by mu.userid ORDER BY FIELD(mu.userid,"+near_by_moveit_data+");";
                    nearbymoveit = await query(moveitlistquery);
                // }
  
                  if (nearbymoveit.length !== 0) {
                
                  console.log('nearbymoveit id-->',nearbymoveit[0].userid);
                  sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[nearbymoveit[0].userid, assign_time, res[i].orderid],async function(err, res2) {
                      if (err) {
                         console.log('Order Update error->',err);
                        i++;
                        order_assign(res,i);
                      } else {
                        var moveit_offline_query = await query(
                          "update Orders_queue set status = 1 where orderid =" +
                            res[i].orderid +
                            ""
                        );
                         var req={};
                        req.state=1;
                        req.moveit_user_id=nearbymoveit[0].userid;
                        Order.update_moveit_lat_long(req);
                        await Notification.orderMoveItPushNotification(
                          res[i].orderid,
                          PushConstant.pageidMoveit_Order_Assigned
                        );
                       // delay(1000);
                       i++;
                       order_assign(res,i);
                      }
                    }
                  );
                }else{
                  i++;
                  order_assign(res,i);
                }
              // }else{
              //   i++;
              //   order_assign(res,i);
    
              // }
            }
          }
        );

  }
  }else{
    isCronRun=false;
  }
}catch(e){
  console.log("e--->",e);
  isCronRun=false;
}

};
//order_auto_assign_Change.start();

////Zone Based Moveit 
QuickSearch.Zone_order_assign= async function Zone_order_assign(res,i){
  try{
    isCronRun=true;
    console.log('i zone-->',i)
    var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
    if (i<res.length) {
      console.log('i res.length-->',res.length)
      //dunzo code
    var today = moment();
    var makeit_accept_time = moment(res[i].makeit_accept_time);
    var diffMs = today - makeit_accept_time;
    var diffDays = Math.floor(diffMs / 86400000);
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    var order_queue_update_time = moment(res[i].updated_at);
    var order_queue_diffMs = today - order_queue_update_time;
    var order_queue_diffMins = Math.round(((order_queue_diffMs % 86400000) % 3600000) / 60000);
    
    console.log("order_queue_diffMins"+order_queue_diffMins);
    console.log("res[i].dunzo_req_count"+res[i].dunzo_req_count);
    console.log("diffMins"+makeit_accept_time);
    console.log("diffMins"+diffMins);
 
    if (dunzoconst.order_assign_dunzo==true && res[i].payment_type==1 && diffMins >= dunzoconst.order_assign_dunzo_waiting_min && res[i].status == 0) {  
      // Dunzo.dunzo_task_create
    //  await QuickSearch.dunzo_task_create(res[i].orderid);

      Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
        if (err) {
          console.log("Dunzo auto assign cod err-------->",err);
          i++;
          Zone_order_assign(res,i);
        } else {
          i++;
          Zone_order_assign(res,i);
          
        }
      });
     
    }else if(res[i].zone_status == 2 && order_queue_diffMins >1 && res[i].status !=1 && (res[i].payment_type==1 || (res[i].payment_type==0 && res[i].price==0 ))){
     console.log("Dunzo zone dunzo_task_create");
     if (res[i].dunzo_req_count >= constant.Dunzo_max_req) {
       var order_cancel={};
       order_cancel.orderid = res[i].orderid;
       order_cancel.cancel_reason ='Dunzo failure to generate task id';
       await QuickSearch.admin_order_cancel(order_cancel);
       i++;
       Zone_order_assign(res,i);
     } else {
      //  await QuickSearch.dunzo_task_create(res[i].orderid);
      //  i++;
      //  Zone_order_assign(res,i);
      Dunzo.dunzo_task_create(res[i].orderid,async function(err,res3) {
        if (err) {
          //result(err, null);
          console.log("Dunzo auto assign dunzo err-------->",err);
          i++;
          Zone_order_assign(res,i);
        } else {
          i++;
          Zone_order_assign(res,i);
          
        }
      });
     }
     
    }else{
      var makeitLocation = [];
      makeitLocation.push(res[i].lat);
      makeitLocation.push(res[i].lon);
      var moveitlistzonequery="select mv.userid from Orders ord left join MakeitUser as mu on mu.userid = ord.makeit_user_id left join MoveitUser as mv on mv.zone = mu.zone where ord.orderid="+res[i].orderid+" and mv.online_status = 1 group by mv.userid";

      var moveitlistquery ="select zo.boundaries,mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Zone as zo on zo.id = mu.zone left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN("+moveitlistzonequery+") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
      var zonemoveitlist = await query(moveitlistquery);
     // console.log("moveitlistquery-->",JSON.stringify(zonemoveitlist));
      if (zonemoveitlist.length !==0) {
            MoveitFireBase.getInsideZoneMoveitList(makeitLocation,zonemoveitlist,async function(err, zoneInsideMoveitlist) {
              if (err){
                i++;
                Zone_order_assign(res,i);
              }
              else{ 
               // console.log("zoneInsideMoveitlist-->",JSON.stringify(zoneInsideMoveitlist));
                if(zoneInsideMoveitlist.length>0){
                    sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[zoneInsideMoveitlist[0].userid, assign_time, res[i].orderid],async function(err, res2) {
                      if (err) {
                        i++;
                        Zone_order_assign(res,i);
                      } else {
                        await query("update Orders_queue set status = 1 where orderid =" +res[i].orderid+"");
                        await Notification.orderMoveItPushNotification(res[i].orderid,PushConstant.pageidMoveit_Order_Assigned);
                        var req={};
                        req.state=1;
                        req.moveit_user_id=zoneInsideMoveitlist[0].userid;
                        Order.update_moveit_lat_long(req);
                        i++;
                        Zone_order_assign(res,i);
                      }
                    });
                }else{
                  i++;
                  Zone_order_assign(res,i);
                }
              }
            });
      }else{
        i++;
        Zone_order_assign(res,i);
      }
    }
    }else{
      isCronRun=false;
    }
  }catch(e){
    console.log("e--->",e);
    isCronRun=false;
  }
};

const Package_tracking = new CronJob("0 0 7,0 * * * ", async function() {
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour = moment(day).format("HH");
  var start_session=7;
  var end_session =0;
  var session_status =0;
  if(currenthour==start_session){
    session_status=1;
  }else if(currenthour==end_session){
    session_status=2;
  }
  console.log("Package_tracking-->",Package_tracking);
  var packageStockQuery ="SELECT mk.userid,it.packageid,it.remaining_count FROM MakeitUser mk right join InventoryTracking it on it.makeit_id=mk.userid left join PackagingBox pb on it.packageid =pb.id where it.id in (SELECT max(id) FROM InventoryTracking where makeit_id=mk.userid GROUP BY packageid) and mk.virtualkey=0"
  var res = await query(packageStockQuery);
  if(res.length>0){
    for(var i=0;i<res.length;i++){
      var packdetail =res[i]
      packdetail.stock_count=packdetail.remaining_count;
      packdetail.makeit_id=packdetail.userid;
      packdetail.pid=packdetail.packageid;
      packdetail.session=session_status;
      var packageStockInventory = new PackageStockInventory(packdetail);
      PackageStockInventory.createpackageSession(packageStockInventory);
    }
  }
});
//Package_tracking.start();

///// KPI Product History CRON ///////////
const kpidashboardproducthistory = new CronJob("* */10 8-23 * * * ", async function(req, result) {
  var breatfastcycle    = constant.breatfastcycle;
  var lunchcycle        = constant.lunchcycle;
  var dinnercyclestart  = constant.dinnercycle;
  var dinnercycle       = constant.dinnerend + 1; //22+1
  var day               = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour       = moment(day).format("HH");
  var CSwherequery      = "";
  
  if ((currenthour >breatfastcycle) && (currenthour < lunchcycle)) {
    CSwherequery = " and prd.breakfast=1";
  } else if ((currenthour >lunchcycle) && (currenthour < dinnercyclestart)) {
    CSwherequery = " and prd.lunch=1";
  } else if ((currenthour >dinnercyclestart) && (currenthour < dinnercycle)) {
    CSwherequery = " and prd.dinner=1";
  } else {
  }

  if (breatfastcycle && lunchcycle && dinnercyclestart && dinnercycle) {
    const getproductdetailscs = await query("select prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.quantity !=0 and prd.delete_status !=1 " +CSwherequery +" group by prd.productid");
      
    if (getproductdetailscs.err) {
      //result(err, null);
      console.log(getproductdetailscs.err);
    } else {
      for (var i = 0; i < getproductdetailscs.length; i++) {
        getproductdetailscs[i].date_time=day;
        var insertkpihistory = await kpiproducthistory.createkpiProducthistory(getproductdetailscs[i]);
      }
    }
  }
});
//kpidashboardproducthistory.start();

////cron run by moveit user offline every cycle end.
const moveitlog_outin = new CronJob("0 0 12,16,23 * * *", async function() {
  console.log("moveit offline & online");
  var res = await query("select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1");
  
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour = moment(day).format("HH");
  var currentminus = currenthour-1;

  if (res.length !== 0) {
    for (let i = 0; i < res.length; i++) {
      /////////logout Moveit-Time log/////////////////
      var req={};
      req.type    = 0;
      req.moveit_userid = res[i].userid;
      req.action  = 2;
      req.created_at = moment().format("YYYY-MM-DD "+currentminus+":59:59");
      req.logtime = moment().format("YYYY-MM-DD "+currentminus+":59:59");
      await Moveituser.create_createMoveitTimelog(req);
      /////////login Moveit-Time log/////////////////
      if(currenthour!=23){
        var req={};
        req.type    = 1;
        req.moveit_userid = res[i].userid;
        req.action  = 2;
        await Moveituser.create_createMoveitTimelog(req);
      }     
    }
  }
});
//moveitlog_outin.start();

////CRON For Every day Moveit Log with Order///////
const moveitlog_everyday = new CronJob("0 0 2 * * *", async function() {
  console.log("Moveit Daywise Report");
  var moveit_daywise_data = await Order.moveit_daywise_report();
  console.log("Moveit daywise Report length",moveit_daywise_data.length);
  if (moveit_daywise_data.length !=0) {    
    for (let i = 0; i < moveit_daywise_data.length; i++) {
      var new_moveit_daywise_data = new MoveitDayWise(moveit_daywise_data[i]);
      await MoveitDayWise.createmoveitdaywise(new_moveit_daywise_data);
    }
  } 
});
//moveitlog_everyday.start();

////CRON For Every day Makeit Log with Order///////
const makeitlog_everyday = new CronJob("0 0 2 * * *", async function() {
  console.log("Makeit Daywise Report");
  var makeit_daywise_data = await Order.makeit_daywise_report();
  console.log("makeit daywise Report length",makeit_daywise_data.length);
  if (makeit_daywise_data.length !=0) {    
    for (let i = 0; i < makeit_daywise_data.length; i++) {
      var new_makeit_daywise_data = new MakeitDayWise(makeit_daywise_data[i]);
      await MakeitDayWise.createmakeitdaywise(new_makeit_daywise_data);
    }
  } 
});
//makeitlog_everyday.start();

///// Cron For BreakFast, Lunch, Dinner Every Cycle Start ///////////
const liveproducthistory_cyclestart = new CronJob("0 0 8,12,16,23 * * *", async function(req, result) {
  console.log("Live Product History Cycle Start");
  await QuickSearch.liveproducthistorycyclestart();
});
//liveproducthistory_cyclestart.start();

///// Cron For BreakFast, Lunch, Dinner Every Cycle End ///////////
const liveproducthistory_cycleend = new CronJob("0 55 11,15,22 * * *", async function(req, result) {
  console.log("Live Product History Cycle End");
  await QuickSearch.liveproducthistorycycleend();
});
//liveproducthistory_cycleend.start();

//////////Live Product History Cycle Start Cron Function//////////////
QuickSearch.liveproducthistorycyclestart = async function liveproducthistorycyclestart(){
  var breatfastcycle = constant.breatfastcycle;
  var lunchcycle = constant.lunchcycle;
  var dinnercyclestart = constant.dinnercycle;
  var dinnercycle = constant.dinnerend + 1; //22+1
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour = moment(day).format("HH");
  var CSselectquery = "";
  var CSwherequery = "";
  var cyclestart = 0;
  
  if (currenthour == breatfastcycle) {
    cyclestart = 1;
    CSselectquery = " 3 as action,"; /////// Cycle Start ////
    CSwherequery = " and prd.breakfast=1";
  } else if (currenthour == lunchcycle) {    
    cyclestart = 1;    
    CSselectquery = " 3 as action,"; ////// Cycle Start ////
    CSwherequery = " and prd.lunch=1";
  } else if (currenthour == dinnercyclestart) {
    cyclestart = 1;    
    CSselectquery = " 3 as action,"; ////// Cycle Start ////
    CSwherequery = " and prd.dinner=1";
  } 

  if (breatfastcycle && lunchcycle && dinnercycle) {
    if (cyclestart == 1) {
      const getproductdetailscs = await query("select" + CSselectquery +" prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN IFNULL(oi.quantity,0) ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 and payment_status<2 THEN IFNULL(oi.quantity,0) ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) left join MakeitUser as mu on mu.userid = prd.makeit_userid where mu.unservicable=0 and prd.active_status = 1 and prd.delete_status !=1 " + CSwherequery + " group by prd.productid");
      if (getproductdetailscs.err) {
        //return(err, null);
        //console.log("error",getproductdetailscs.err);
      } else {
        for (var i = 0; i < getproductdetailscs.length; i++) {
          var inserthistory = await producthistory.createProducthistory(getproductdetailscs[i]);
        }
        const getmakeitlistcs = await query("select distinct prd.makeit_userid as makeit_id from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) left join MakeitUser as mu on mu.userid = prd.makeit_userid where mu.unservicable=0 and prd.active_status = 1 and prd.delete_status !=1 "+CSwherequery +" group by prd.productid");
        for(let j=0; j<getmakeitlistcs.length; j++){
          getmakeitlistcs[j].type=0;
          for (let k = 0; k<getproductdetailscs.length; k++) {
            if(getmakeitlistcs[j].makeit_id == getproductdetailscs[k].makeit_id){
              if(getproductdetailscs[k].actual_quantity>0){
                if(getmakeitlistcs[j].type==0){
                  getmakeitlistcs[j].type = 1;
                }                
              }
            }
          }
        }
        var makeitlogcs = getmakeitlistcs.filter(log => log.type===1);
        for (var i=0; i<makeitlogcs.length; i++) {
          var insertlog = await Makeitlog.createmakeittimelog(makeitlogcs[i]);
        }
      }
    }    
  }
  return insertlog;
}

//////////Live Product History Cycle End Cron Function//////////////
QuickSearch.liveproducthistorycycleend = async function liveproducthistorycycleend(){
  var day           = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour   = moment(day).format("HH:mm");
  var CEselectquery = "";
  var CEwherequery  = "";
  var cycleend      = 0;

  if (currenthour == "11:55") {
    cycleend = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery  = " and prd.breakfast=1";
  } else if (currenthour == "15:55") {
    cycleend = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery  = " and prd.lunch=1";
  } else if (currenthour == "22:55") {
    cycleend = 1;
    CEselectquery = " 4 as action,"; ////// Cycle End ////
    CEwherequery  = " and prd.dinner=1";
  } 

  if (cycleend == 1) {
    const getproductdetailsce = await query("select" + CEselectquery + " prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN IFNULL(oi.quantity,0) ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 and payment_status<2 THEN IFNULL(oi.quantity,0) ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) left join MakeitUser as mu on mu.userid = prd.makeit_userid where mu.unservicable=0 and prd.active_status = 1 and prd.delete_status !=1 " + CEwherequery + " group by prd.productid");
      if (getproductdetailsce.err) {
        //return(err, null);
        //console.log(getproductdetailsce.err);
      } else {
        for (var i = 0; i < getproductdetailsce.length; i++) {
          var inserthistory = await producthistory.createProducthistory(getproductdetailsce[i]);
        }
        const getmakeitlistce = await query("select distinct prd.makeit_userid as makeit_id from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) left join MakeitUser as mu on mu.userid = prd.makeit_userid where mu.unservicable=0 and prd.active_status = 1 and prd.delete_status !=1 " +CEwherequery +" group by prd.productid");
        for(let j=0; j<getmakeitlistce.length; j++){
          getmakeitlistce[j].type = 1;
          for (let k = 0; k<getproductdetailsce.length; k++) {
            if(getmakeitlistce[j].makeit_id == getproductdetailsce[k].makeit_id){
              if(getproductdetailsce[k].actual_quantity>0){
                if(getmakeitlistce[j].type==1){
                  getmakeitlistce[j].type = 0;
                }                
              }
            }
          }
        }
        var makeitlogce = getmakeitlistce.filter(log => log.type===0);
        for (var i=0; i<makeitlogce.length; i++) {
          var insertlog = await Makeitlog.createmakeittimelog(makeitlogce[i]);
        }
      }
    }  
  return insertlog;
}

/////////Homemaker Tiering///////////////////////
const homemakertiering = new CronJob("0 0 3 * * *", async function() {
  //console.log("Homemaker Tiering");
  var makeit_incentive = await Order.makeit_incentive_report();
});

var currentdatecheck = new Date();
var currentday = currentdatecheck.getDay()
if(currentday ==1 ){
 // homemakertiering.start();
}


//const Makeit_lost_revenue_report = new CronJob("0 0 2 * * *", async function() {
  const Makeit_lost_revenue_report = new CronJob("0 0 4 * * *", async function(req, result) {
  var Makeit_lost_revenue = "SELECT a.makeit_id,sum(a.expected_revenue)as expected_revenue FROM( select pth.makeit_id,pth.product_id,Max(pth.actual_quantity+pth.pending_quantity+pth.ordered_quantity) as maxvalues, (Max(pth.actual_quantity+pth.pending_quantity+pth.ordered_quantity) * pt.original_price) as expected_revenue from Live_Product_History  pth left outer join Product pt on pt.productid=pth.product_id   where date(pth.created_at)=CURDATE()-1  group by pth.product_id )a GROUP by a.makeit_id";

  var Makeit_lost_revenue_list = await query(Makeit_lost_revenue);
  //console.log("---------------------------->,",Makeit_lost_revenue_list);
  if (Makeit_lost_revenue_list) {
    for (let i = 0; i < Makeit_lost_revenue_list.length; i++) {


    var makeit_earning = await query("select id,makeit_id,total_makeit_earnings from Makeit_daywise_report where  makeit_id ='"+Makeit_lost_revenue_list[i].makeit_id+"' and date(date)=CURDATE()-1 order by id desc limit 1");

    var getdate = moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
    //console.log("makeit_earning",makeit_earning);
    if (makeit_earning.length !=0) {
      
     var total_lost = Makeit_lost_revenue_list[i].expected_revenue;
      if (makeit_earning[0].total_makeit_earnings !=0) {
        Makeit_lost_revenue_list[i].total_makeit_earnings=makeit_earning[0].total_makeit_earnings;

        if (Makeit_lost_revenue_list[i].expected_revenue == makeit_earning[0].total_makeit_earnings) {
          Makeit_lost_revenue_list[i].status=0;
          Makeit_lost_revenue_list[i].total_lost_revenue=0;
        } else if (Makeit_lost_revenue_list[i].expected_revenue > makeit_earning[0].total_makeit_earnings) {
          Makeit_lost_revenue_list[i].status=1;
          Makeit_lost_revenue_list[i].total_lost_revenue=Makeit_lost_revenue_list[i].expected_revenue - makeit_earning[0].total_makeit_earnings;
        }else{
          Makeit_lost_revenue_list[i].status=2;
          Makeit_lost_revenue_list[i].total_lost_revenue=0
        }
      }else{
        Makeit_lost_revenue_list[i].total_makeit_earnings=0;
        Makeit_lost_revenue_list[i].status=1;
        Makeit_lost_revenue_list[i].total_lost_revenue=total_lost;
      }
      
      Makeit_lost_revenue_list[i].logtime=getdate;

    }else{
    
      Makeit_lost_revenue_list[i].total_makeit_earnings=0;
      Makeit_lost_revenue_list[i].status=2;
      Makeit_lost_revenue_list[i].total_lost_revenue=total_lost;
      Makeit_lost_revenue_list[i].logtime=getdate;

    }

    var new_Makeittotalrevenue= new Makeittotalrevenue(Makeit_lost_revenue_list[i]);
    console.log("new_Makeittotalrevenue",new_Makeittotalrevenue);
    Makeittotalrevenue.createMakeittotalrevenue(new_Makeittotalrevenue);

    }
  }
 
});
//Makeit_lost_revenue_report.start();

module.exports = QuickSearch;