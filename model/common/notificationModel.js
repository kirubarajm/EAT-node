"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var FCM_Moveit = require("../../push/Moveit_SendNotification.js");
var FCM_EAT = require("../../push/Eat_SendNotification.js");
var FCM_Makeit = require("../../push/Makeit_SendNotification.js");
var FCM_Sales = require("../../push/Sales_SendNotification.js");
var FCM_ADMIN = require("../../push/Admin_SendNotification.js");

var PushConstant = require("../../push/PushConstant.js");

var Notification = function(notification) {
  this.title = notification.title;
  this.message = notification.message;
};

Notification.getPushOrderDetail = async function(orderid) {
  var orders = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail,"+
    "JSON_OBJECT('userid',ms.userid,'name',ms.name,'brandName',ms.brandName,'virtualkey',ms.virtualkey,'pushid_android',ms.pushid_android) as makeitdetail,"+
    "JSON_OBJECT('userid',mu.userid,'name',mu.name,'Vehicle_no',mu.Vehicle_no,'pushid_android',mu.pushid_android) as moveitdetail "+
    "from Orders as ors "+
    "left join User as us on ors.userid=us.userid "+
    "left join MakeitUser ms on ors.makeit_user_id = ms.userid "+
    "left join MoveitUser mu on mu.userid = ors.moveit_user_id "+
    "where ors.orderid ='" +orderid +"'"
  );
  return orders[0];
};

Notification.getVirtualMakeitPushId = async function(makeit_id) {
  var vMkPushId = await query("SELECT au.push_token from MakeitUser mu left join Admin_users au on au.makeit_hubid=mu.makeithub_id where userid ='" +makeit_id +"'"
  );
  return vMkPushId[0];
};

Notification.getEatUserDetail = async function(userid) {
  var EatUser = await query("SELECT * FROM User where userid = " + userid);
  return EatUser[0];
};

Notification.getMovieitDetail = async function(userid) {
  var MoveitUser = await query("SELECT * FROM MoveitUser where userid = " + userid);
  return MoveitUser[0];
};

Notification.orderEatPushNotification = async function(
  orderid,
  userid,
  pageid
) {
  var orders = await Notification.getPushOrderDetail(orderid);
  var user = JSON.parse(orders.userdetail);
  var makeituser = JSON.parse(orders.makeitdetail);
  var moveituser = JSON.parse(orders.moveitdetail);

  var data = null;
  switch (pageid) {
    case PushConstant.Pageid_eat_order_post:
      data = {
        title: "Order Post",
        message: "Hi! your Order posted successful.Your OrderID is#" + orderid,
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_eat_order_accept:
      var mk_username=makeituser.brandName||""
      mk_username=mk_username?" by "+mk_username :""
      data = {
        title: "Your order has been accepted "+mk_username,
        message: "Your order will be delivered in approximately 30 minutes",
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "2"
      };
      break;

      case PushConstant.masteridOrder_Prepared:
      var mk_username=makeituser.brandName||""
      mk_username=mk_username?" by "+mk_username :""
      data = {
        title: "Your order has been prepared "+mk_username,
        message: "Your order will be delivered in approximately 30 minutes.",
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "2"
      };
      break;

    case PushConstant.Pageid_eat_order_pickedup:
        var mo_username=moveituser.name||""
        mo_username=mo_username?" by "+mo_username :""
      data = {
        title: "Your order has been picked up "+mo_username,
        message: "Call our delivery executive for further information.",
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "2"
      };
      break;

    case PushConstant.Pageid_eat_order_reached:
      data = {
        title: "Your order near to me",
        message: "Your Order Waiting.Please picked up",
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_eat_order_delivered:
      data = {
        title: "Order Delivered",
        message: "Hi! your Order Delivered successfully",
        pageid: "" + pageid,
        app: "Eat",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_eat_order_cancel:
      var  message = "We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for more details.";
      if(orders.payment_type==="1"){
        message = "We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. ";
      }
      //COD
      // Content - We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for for more details."
      //online
      //Content - We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. "
      data = {
        title: "Your order has been cancelled due to unforeseen circumstances.",
        message: message,
        pageid: "" + pageid,
        payment_type:orders.payment_type,
        app: "Eat",
        notification_type: "2"
      };

      break;
  }
  if (data == null) return;
  //const user = await Notification.getEatUserDetail(userid);
  if (user && user.pushid_android) {
    FCM_EAT.sendNotificationAndroid(user.pushid_android, data);
  }
  console.log("data->", data);
  if (user && user.pushid_ios) {
    FCM_EAT.sendNotificationAndroid(user.pushid_ios, data);
  }
};

Notification.orderMakeItPushNotification = async function(
  orderid,
  makeit_userid,
  pageid
) {
  console.log("orderid->", orderid);
    var orders = await Notification.getPushOrderDetail(orderid);
    var user = JSON.parse(orders.userdetail);
    var makeituser = JSON.parse(orders.makeitdetail);
    var moveituser = JSON.parse(orders.moveitdetail);

  var data = null;
  switch (pageid) {
    case PushConstant.pageidMakeit_Order_Post:
      data = {
        title: "New Order Posted",
        message: "OrderID is#" + orderid,
        pageid: "" + pageid,
        app: "Make-it",
        orderid: "" + orderid,
        notification_type: "1"
      };
      break;

    case PushConstant.pageidMakeit_Order_Cancel:
      data = {
        title: "Order Canceled",
        message: "Sorry,Order canceled by user.OrderID is#" + orderid,
        pageid: "" + pageid,
        app: "Make-it",
        orderid: "" + orderid,
        notification_type: "1"
      };
      break;
  }

  if (data == null) return;

  if (makeituser && makeituser.pushid_android&&makeituser.virtualkey===0) {
    console.log("Android->", makeituser.pushid_android);
    FCM_Makeit.sendNotificationAndroid(makeituser.pushid_android, data);
  }else{
   
    var pushDetail = await Notification.getVirtualMakeitPushId(makeituser.userid);
    console.log("Web->", pushDetail.push_token);
    if(pushDetail.push_token) FCM_ADMIN.sendNotificationWEB(pushDetail.push_token, data);
  }
};

Notification.orderMoveItPushNotification = async function(
  orderid,
  pageid,
  move_it_user_detail
) {
  
  const orders = await Notification.getPushOrderDetail(orderid);
 // const moveitdetails = await Notification.getMovieitDetail()
  var Eatuserdetail = JSON.parse(orders.userdetail);
  var data = null;

  switch (pageid) {
    case PushConstant.pageidMoveit_Order_Assigned:
     // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "Order assign",
        message: "Order Assigned to you. OrderID is#" + orderid,
        pageid: "" + pageid,
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
        app: "Move-it",
        notification_type: "1"
      };
      break;

    case PushConstant.pageidMoveit_Order_Cancel:
     // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "Order Cancel",
        message:
          "Sorry! your current orders is canceled. OrderID is#" + orderid,
        pageid: "" + pageid,
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
        app: "Move-it",
        notification_type: "1"
      };
      break;

    case PushConstant.pageidMoveit_Order_Prepared:
      data = {
        title: "Order is Prepared",
        message: "Hi! Your current order is prepared.",
        pageid: "" + pageid,
        app: "Move-it",
        notification_type: "1"
      };

      break;
      case PushConstant.pageidMoveit_Order_Reassign:
      data = {
        title: "Order Re-assigned",
        message: "Your order has been assigned to another moveit.",
        pageid: "" + pageid,
        app: "Move-it",
        notification_type: "1",
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
     
      };

      break;
  }

  if (data == null) return;

  if (!move_it_user_detail) {
    move_it_user_detail = await query(
      "SELECT * FROM MoveitUser where userid = " + orders.moveit_user_id
    );
    move_it_user_detail = move_it_user_detail[0];
  }

  if (move_it_user_detail && move_it_user_detail.pushid_android) {
    FCM_Moveit.sendNotificationAndroid(
      move_it_user_detail.pushid_android,
      data
    );
  }
};

Notification.appointment_makeit_PushNotification = async function(
  makeit_userid,
  status,
  sales_userid,
  datetime
) {
  var sales_user_detail = await query(
    "SELECT name FROM Sales_QA_employees where id = " + sales_userid
  );
  sales_user_detail = sales_user_detail[0];
  var data = null;
  var salesman_name = sales_user_detail.name;
  switch (status) {
    case 2:
      data = {
        title: "Info session scheduled",
        message:
          "Your Info Session assigned to " + salesman_name + " on " + datetime,
        pageid: "3",
        app: "Make-it",
        notification_type: "1"
      };
      break;

    case 4:
      data = {
        title: "Sales session scheduled",
        message:
          "Your Sales Session assigned to " + salesman_name + " on " + datetime,
        pageid: "3",
        app: "Make-it",
        notification_type: "1"
      };
      break;
  }
  var Makeituser = await query(
    "SELECT pushid_android FROM MakeitUser where userid = " + makeit_userid
  );
  if (Makeituser && Makeituser[0].pushid_android && data) {
    FCM_Makeit.sendNotificationAndroid(Makeituser[0].pushid_android, data);
  }
};

Notification.sales_PushNotification = async function(
  sales_userid,
  makeit_userid,
  allocationTime,
  status
) {
  var makeit_user_detail = await query(
    "SELECT name FROM MakeitUser where userid = " + makeit_userid
  );
  makeit_user_detail = makeit_user_detail[0];
  var data = null;
  var makeit_name = makeit_user_detail.name;
  var brand_name = makeit_user_detail.name;
  var address = makeit_user_detail.name;
  switch (status) {
    case 2:
      data = {
        title: "Info session assigned",
        message: brand_name + " on " + allocationTime,
        pageid: "1",
        app: "sales",
        sales_user_id: "" + sales_userid,
        makeit_name: "" + makeit_name,
        brand_name: "" + brand_name,
        allocationTime: "" + allocationTime,
        place: "" + address,
        notification_type: "1"
      };
      break;

    case 4:
      data = {
        title: "Sales session assigned",
        message: brand_name + " on " + allocationTime,
        pageid: "1",
        app: "sales",
        sales_user_id: "" + sales_userid,
        makeit_name: "" + makeit_name,
        brand_name: "" + brand_name,
        allocationTime: "" + allocationTime,
        place: "" + address,
        notification_type: "1"
      };
      break;
  }
  var Salesuser = await query(
    "SELECT pushid_android FROM Sales_QA_employees where id = " + sales_userid
  );
  if (Salesuser && Salesuser[0].pushid_android && data) {
    FCM_Sales.sendNotificationAndroid(Salesuser[0].pushid_android, data);
  }
};

Notification.queries_answers_PushNotification = async function(
  userid,
  qid,
  answer,
  type
) {
  var Userdetails = null;
  var userTable = "";
  var FCM_Obj = null;
  var appname = "";
  var pageid = "0";
  var ID = "";
  console.log("type--->",type);
  if (type === 1) {
    userTable = "MakeitUser";
    ID = "userid";
    FCM_Obj = FCM_Makeit;
    appname = "Makeit";
    pageid = "" + PushConstant.pageidMakeit_Replies;
  } else if (type === 2) {
    userTable = "MoveitUser";
    ID = "userid";
    FCM_Obj = FCM_Moveit;
    appname = "Moveit";
    pageid = "" + PushConstant.pageidMoveit_Replies;
  } else if (type === 3) {
    userTable = "Sales_QA_employees";
    ID = "id";
    FCM_Obj = FCM_Sales;
    appname = "Sales";
    pageid = "4";
  } else if (type === 4) {
    userTable = "User";
    ID = "userid";
    FCM_Obj = FCM_EAT;
    appname = "Eat";
    pageid = "" + PushConstant.Pageid_eat_query_replay;
  }

  var data = null;
  data = {
    title: "Queries Replied",
    message: answer,
    pageid: pageid, //Need to change depends on type
    app: appname,
    notification_type: "1"
  };

  Userdetails = await query(
    "SELECT * FROM " + userTable + " where " + ID + " = " + userid
  );

  if (Userdetails && Userdetails[0].pushid_ios) {
    FCM_EAT.sendNotificationAndroid(Userdetails[0].pushid_ios, data);
  }

  if (Userdetails && Userdetails[0].pushid_android && data) {
    FCM_Obj.sendNotificationAndroid(Userdetails[0].pushid_android, data);
  }
};

module.exports = Notification;
