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


const query = util.promisify(sql.query).bind(sql);
var QuickSearch = function(QuickSearch) {
  this.eatuserid = QuickSearch.eatuserid;
  this.productid = QuickSearch.productid || 0;
  //this.created_at = new Date();
  this.makeit_userid = QuickSearch.makeit_userid || 0;
};

QuickSearch.eat_explore_store_data_by_cron = async function eat_explore_store_data_by_cron(
  search,
  result
) {
  // try {
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
      //  console.log("breakfast");
    } else if (currenthour >= lunchcycle && currenthour <= dinnercycle) {
      cyclequery = cyclequery + " and pt.lunch = 1";
      //  console.log("lunch");
    } else if (currenthour >= dinnercycle) {
      cyclequery = cyclequery + " and pt.dinner = 1";
      //  console.log("dinner");
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
  // } catch (error) {
  //    let sucobj = true;
  //    let resobj = {
  //      success : sucobj,
  //      result  : res
  //     };
  //     result(null, resobj);
  // }
};

// This cron is to running all region and product and makeit to quick search
//console.log('Before job instantiation');
const job = new CronJob("0 */1 * * * *", async function(search, result) {
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
            //  console.log("breakfast");
          } else if (currenthour >= lunchcycle && currenthour <= dinnercycle) {
            cyclequery = cyclequery + " and pt.lunch = 1";
            //  console.log("lunch");
          } else if (currenthour >= dinnercycle) {
            cyclequery = cyclequery + " and pt.dinner = 1";
            //  console.log("dinner");
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
job.start();

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
job1.start();

QuickSearch.eat_explore_quick_search = function eat_explore_quick_search(
  req,
  result
) {
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
liveproducthistory.start();

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

      //  var today = moment();
      //  var ordertime = moment(res[i].ordertime);
      //  var diffMs  = (today - ordertime);
      //  var diffDays = Math.floor(diffMs / 86400000);
      //  var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      //  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    }
  }
});
job1moveitlogout.start();

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
//order_auto_assign.start();

//online refund coupon
QuickSearch.dunzo_task_create = function dunzo_task_create(orderid) {

  Dunzo.dunzo_task_create(orderid, function(err, res) {
    if (err) return err;
    else return res;
  });
};


const order_auto_assign_Change = new CronJob("* */1 7-23 * * * ", async function() {
  if (constant.order_assign_status==true) {
  var i = 0;
  var res = await query(
    "select oq.*,mk.makeithub_id,mk.userid,mk.lat,mk.lon,ors.makeit_accept_time,ors.payment_type from Orders_queue as oq join Orders as ors on ors.orderid=oq.orderid join MakeitUser as mk on mk.userid = ors.makeit_user_id where status = 0 or status = 2 order by ors.ordertime ASC"
  ); //and created_at > (NOW() - INTERVAL 10 MINUTE
  console.log('res length-->',res.length);
  
  console.log('isCronRun-->',isCronRun);
  if (res.length !== 0&&!isCronRun) {
    ////Start: Zone Based Order Assign //////////////
    if(constant.zone_control){
      QuickSearch.Zone_order_assign(res,i);
    }else{
      QuickSearch.order_assign(res,i);
    }
    ////End: Zone Based Order Assign ////////////// 
  }
  }
});

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
    var diffDays = Math.floor(diffMs / 86400000);
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    console.log("diffMins"+diffMins);
    console.log("res[i].payment_type"+res[i].payment_type);
         console.log("res[i].status"+res[i].status);
 
     if (constant.order_assign_dunzo==true && res[i].payment_type==1 && diffMins > constant.order_assign_dunzo_waiting_min && res[i].status == 0) {  
       // Dunzo.dunzo_task_create
       await QuickSearch.dunzo_task_create(res[i].orderid);

      }else{

        var geoLocation = [];
        geoLocation.push(res[i].lat);
        geoLocation.push(res[i].lon);
        MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,constant.nearby_moveit_radius,async function(err, move_it_id_list) {
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
              var moveitlist = move_it_id_list.moveitid;
              console.log('moveitlist.length->',moveitlist.length);
              if (moveitlist.length > 0) {
                var moveitlistquery =
                  "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
                  move_it_id_list.moveitid +
                  ") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
                var nearbymoveit = await query(moveitlistquery);
                 console.log('nearbymoveit.length->',nearbymoveit.length);
                if (nearbymoveit.length !== 0) {
                  // nearbymoveit.sort(
                  //   (a, b) => parseFloat(a.ordercout) - parseFloat(b.ordercout)
                  // );
                  console.log('nearbymoveit id-->',nearbymoveit[0].userid);
                  sql.query(
                    "UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",
                    [nearbymoveit[0].userid, assign_time, res[i].orderid],
                    async function(err, res2) {
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
              }else{
                i++;
                order_assign(res,i);
    
              }
            }
          }
        );

      }
    


    // var geoLocation = [];
    // geoLocation.push(res[i].lat);
    // geoLocation.push(res[i].lon);
    // MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,constant.nearby_moveit_radius,async function(err, move_it_id_list) {
    //     if (err) {
    //       let error = {
    //         success: true,
    //         status: false,
    //         message: "No Move-it found,please after some time"
    //       };
    //       console.log('Geo error->',err);
    //       i++;
    //       order_assign(res,i);
    //     } else {
    //       var moveitlist = move_it_id_list.moveitid;
    //       console.log('moveitlist.length->',moveitlist.length);
    //       if (moveitlist.length > 0) {
    //         var moveitlistquery =
    //           "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
    //           move_it_id_list.moveitid +
    //           ") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
    //         var nearbymoveit = await query(moveitlistquery);
    //          console.log('nearbymoveit.length->',nearbymoveit.length);
    //         if (nearbymoveit.length !== 0) {
    //           // nearbymoveit.sort(
    //           //   (a, b) => parseFloat(a.ordercout) - parseFloat(b.ordercout)
    //           // );
    //           console.log('nearbymoveit id-->',nearbymoveit[0].userid);
    //           sql.query(
    //             "UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",
    //             [nearbymoveit[0].userid, assign_time, res[i].orderid],
    //             async function(err, res2) {
    //               if (err) {
    //                  console.log('Order Update error->',err);
    //                 i++;
    //                 order_assign(res,i);
    //               } else {
    //                 var moveit_offline_query = await query(
    //                   "update Orders_queue set status = 1 where orderid =" +
    //                     res[i].orderid +
    //                     ""
    //                 );
    //                 await Notification.orderMoveItPushNotification(
    //                   res[i].orderid,
    //                   PushConstant.pageidMoveit_Order_Assigned
    //                 );
    //                // delay(1000);
    //                i++;
    //                order_assign(res,i);
    //               }
    //             }
    //           );
    //         }else{
    //           i++;
    //           order_assign(res,i);
    //         }
    //       }else{
    //         i++;
    //         order_assign(res,i);

    //       }
    //     }
    //   }
    // );

    
    //}
  }else{
    isCronRun=false;
  }
}catch(e){
  console.log("e--->",e);
  isCronRun=false;
}

};
order_auto_assign_Change.start();

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
    console.log("diffMins"+makeit_accept_time);

    console.log("diffMins"+diffMins);
 
     if (constant.order_assign_dunzo==true && res[i].payment_type==1 && diffMins > constant.order_assign_dunzo_waiting_min && res[i].status == 0) {  
       // Dunzo.dunzo_task_create
       await QuickSearch.dunzo_task_create(res[i].orderid);

      }else{
      var makeitLocation = [];
      makeitLocation.push(res[i].lat);
      makeitLocation.push(res[i].lon);
      var moveitlistzonequery="select mv.userid from Orders ord left join MakeitUser as mu on mu.userid = ord.makeit_user_id left join MoveitUser as mv on mv.zone = mu.zone where ord.orderid="+res[i].orderid+" and mv.online_status = 1 group by mv.userid";
     
      var moveitlistquery ="select zo.boundaries,mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Zone as zo on zo.id = mu.zone left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN("+moveitlistzonequery+") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
      var zonemoveitlist = await query(moveitlistquery);
      //console.log("moveitlistquery-->",JSON.stringify(zonemoveitlist));
      if (zonemoveitlist.length !==0) {
            MoveitFireBase.getInsideZoneMoveitList(makeitLocation,zonemoveitlist,async function(err, zoneInsideMoveitlist) {
              if (err){
                i++;
                Zone_order_assign(res,i);
              }
              else{ 
                console.log("zoneInsideMoveitlist-->",JSON.stringify(zoneInsideMoveitlist));
                if(zoneInsideMoveitlist.length>0){
                    sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[zoneInsideMoveitlist[0].userid, assign_time, req.orderid],async function(err, res2) {
                      if (err) {
                        i++;
                        Zone_order_assign(res,i);
                      } else {
                        await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");
                        await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned);
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
    isCronRun=false;
  }
};

module.exports = QuickSearch;
