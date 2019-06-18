"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var FCM_Moveit = require("../../push/Moveit_SendNotification.js");
var FCM_EAT = require("../../push/Eat_SendNotification.js");
var FCM_Makeit = require("../../push/Makeit_SendNotification.js");
var FCM_Sales = require("../../push/Sales_SendNotification.js");

var PushConstant = require("../../push/PushConstant.js");

var Notification = function(notification) {
  this.title = notification.title;
  this.message = notification.message;
};

Notification.getPushOrderDetail = async function(orderid) {
  var orders = await query("SELECT * FROM Orders where orderid = " + orderid);
  return orders[0];
};

Notification.getEatUserDetail = async function(userid) {
  var EatUser = await query("SELECT * FROM User where userid = " + userid);
  return EatUser[0];
};

Notification.orderEatPushNotification = async function(
  orderid,
  userid,
  pageid
) {
  if (!userid) {
    var orders = await Notification.getPushOrderDetail(orderid);
    userid = orders.userid;
    console.log(
      "orderid--->" +
        orderid +
        "---userid-->" +
        userid +
        "---pageid--->" +
        pageid
    );
  }

  var push_title = null;
  var push_message = null;
  switch (pageid) {
    case PushConstant.pageidOrder_Post:
      push_title = "Order Post";
      push_message =
        "Hi! your Order posted successful.Your OrderID is#" + orderid;
      break;

    case PushConstant.pageidOrder_Accept:
      push_title = "Order Accecpt";
      push_message =
        "Hi! your Order accepted successful.Please wait for some more time";
      break;

    case PushConstant.pageidOrder_Pickedup:
      push_title = "Order Picked up";
      push_message =
        "Hi! your Order Picked up.Please wait your food reaced soon.";
      break;

    case PushConstant.pageidOrder_Reached:
      push_title = "Order Near to me";
      push_message = "Hi! your Order Waiting.Please picked up";
      break;

    case PushConstant.pageidOrder_Delivered:
      push_title = "Order Delivered";
      push_message = "Hi! your Order Delivered successful";
      break;
  }
  const user = await Order.getEatUserDetail(userid);
  console.log("user--->" + user.name);
  if (user.pushid_android) {
    FCM_EAT.sendOrderNotificationAndroid(
      user.pushid_android,
      push_title,
      push_message,
      pageid
    );
  }
};

Notification.orderMakeItPushNotification = async function(
  orderid,
  makeit_userid,
  pageid
) {
  if (!makeit_userid) {
    var orders = await Notification.getPushOrderDetail(orderid);
    makeit_user_id = orders.makeit_user_id;
  }

  var data = null;
  switch (pageid) {
    case PushConstant.pageidMakeit_Order_Post:
      data = {
        title: "New Order Posted",
        message: "OrderID is#" + orderid,
        pageid: "" + pageid,
        app: "Make-it",
        notification_type: "1"
      };
      break;

    case PushConstant.pageidMakeit_Order_Cancel:
      data = {
        title: "Order Cancel",
        message: "Sorry,Order cancel OrderID is#" + orderid,
        pageid: "" + pageid,
        app: "Make-it",
        notification_type: "1"
      };
      break;
  }
  var Makeituser = await query(
    "SELECT * FROM MakeitUser where userid = " + makeit_user_id
  );
  if (Makeituser && Makeituser[0].pushid_android && data) {
    FCM_Moveit.sendMakeitOrderPostNotification(Makeituser[0].pushid_android, data);
  }
};

Notification.orderMoveItPushNotification = async function(
  orderid,
  pageid,
  move_it_user_detail
) {
  const orders = await Notification.getPushOrderDetail(orderid);
  var Eatuserid = orders.userid;
  var payload = null;
  var Eatuserdetail = null;

  switch (pageid) {
    case PushConstant.pageidMoveit_Order_Assigned:
      Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      payload = {
        data: {
          title: "Order assign",
          message: "Order Assigned to you. OrderID is#" + orderid,
          pageid: "" + pageid,
          name: "" + Eatuserdetail.name,
          price: "" + orders.price,
          orderid: "" + orders.orderid,
          place: "" + orders.cus_address,
          app: "Move-it",
          notification_type: "1"
        }
      };
      break;

    case PushConstant.pageidMoveit_Order_Cancel:
      Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      payload = {
        data: {
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
        }
      };
      break;

    case PushConstant.pageidMoveit_Order_Prepared:
      payload = {
        data: {
          title: "Order is Prepared",
          message: "Hi! Your current order is prepared.",
          pageid: "" + pageid,
          app: "Move-it",
          notification_type: "1"
        }
      };

      break;
  }

  if (payload == null) return;

  if (!move_it_user_detail) {
    move_it_user_detail = await query(
      "SELECT * FROM MoveitUser where userid = " + orders.moveit_user_id
    );
    move_it_user_detail = move_it_user_detail[0];
  }

  if (move_it_user_detail && move_it_user_detail.pushid_android) {
    FCM_Moveit.sendMoveitOrderAssignNotification(
      move_it_user_detail.pushid_android,
      payload
    );
  }
};


Notification.appointment_makeit_PushNotification = async function(
  makeit_userid,
  status, sales_userid, datetime
) {
var sales_user_detail = await query(
    "SELECT name FROM Sales_QA_employees where id = " + sales_userid
);
sales_user_detail=sales_user_detail[0];
var data = null;
var salesman_name = sales_user_detail.name;
console.log("outside");
  switch (status) {
    case 2:
      data = {
        title: "Info session scheduled",
        message: "Your Info Session for EAT is assigned to "+salesman_name+ " on " + datetime ,
        pageid: "3",
        app: "Make-it",
        notification_type: "1"
      };
      console.log("22");
      break;

      case 4:
        data = {
          title: "Sales session scheduled",
          message: "Your Sales Session for EAT is assigned to "+salesman_name+ " on " + datetime ,
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


Notification.queries_answers_PushNotification = async function(
  userid,qid,answer,type
) {
  var Userdetails = null;
  var userTable="";
  var FCM_Obj =null;
  var appname="";
  if(type=1) {userTable="MakeitUser"; FCM_Obj =FCM_Makeit; appname="Makeit"}
  else if(type=2) {userTable="MoveitUser"; FCM_Obj =FCM_Moveit; appname="Moveit"}
  else if(type=3) {userTable="Sales_QA_employees"; FCM_Obj =FCM_Sales; appname="Sales";}
  else if(type=4) {userTable="User"; FCM_Obj =FCM_EAT; appname="Eat";}

  var data = null;
  data = {
        title: "Queries Replied",
        message: answer,
        pageid: "4", //Need to change depends on type
        app: appname, 
        notification_type: "1"
      };

  Userdetails = await query(
    "SELECT * FROM "+userTable+" where userid = " + userid
  );
  if (Userdetails && Userdetails[0].pushid_android && data) {
    //if(type==1)
    FCM_Obj.sendNotificationAndroid(Userdetails[0].pushid_android, data);
  }
};


module.exports = Notification;
