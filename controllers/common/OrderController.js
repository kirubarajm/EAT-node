"use strict";

var Order = require("../../model/common/orderModel.js");

exports.list_all_product = function(req, res) {
  Order.getAllProduct(function(err, product) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", product);
    res.send(product);
  });
};

exports.eatuser_order_create = function(req, res) {
  var order_item = req.body.orderitems;
  if (!req.body.aid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide Address Id"
      });
  } else if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.createOrder(req.body, order_item, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.read_a_product = function(req, res) {
  Order.getProductById(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.update_a_product = function(req, res) {
  Order.updateById(req.params.id, new Product(req.body), function(
    err,
    product
  ) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.delete_a_product = function(req, res) {
  Order.remove(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json({ message: "Product successfully deleted" });
  });
};

exports.list_all_orders = function(req, res) {
  Order.get_all_orders(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.list_today_virtual_makeit_orders = function(req, res) {
  Order.get_today_vorders(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.list_all_virtual_makeit_orders = function(req, res) {
  Order.get_all_vorders(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.order_view = function(req, res) {
  Order.orderviewbyadmin(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.order_status_update = function(req, res) {
  Order.updateOrderStatus(req.body, function(err, order) {
    if (err) res.send(err);
    res.send(order);
  });
};

exports.order_view_eatuser = function(req, res) {
  if (!req.params.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.orderviewbyeatuser(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};

exports.order_list_eatuser = function(req, res) {
 
  // if (!req.params.userid) {
  //   res.status(400).send({ error: true,status:false, message: "Please provide userid" });
  // }else{
  Order.orderlistbyeatuser(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
//}
};

exports.order_assign = function(req, res) {
  console.log(req.body);
  Order.order_assign(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.un_assign_orders = function(req, res) {
  Order.getUnassignorders(function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderlist_by_moveit_userid = function(req, res) {
  console.log("V1--> 1.0.0");
  Order.orderlistbymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderlist_by_moveit_userid_V2 = function(req, res) {
  console.log("V2--> 2.0.0");
  Order.orderlistbymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderview = function(req, res) {
  Order.orderviewbymoveituser(req.params.orderid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.order_pickup_status = function(req, res) {
  var kitchenqualitylist = req.body.qualitychecklist;

  // console.log(kitchenqualitylist);
  //   if(kitchenqualitylist.length === 0 || kitchenqualitylist.length === undefined || kitchenqualitylist.length === null) {
  //     res.status(400).send({ error: true, message: 'Please provide order quality list' });
  //   }else{

  Order.order_pickup_status_by_moveituser(
    req.body,
    kitchenqualitylist,
    function(err, result) {
      if (err) res.send(err);
      res.json(result);
    }
  );
  // }
};

exports.admin_order_cancel = function(req, res) {
  Order.admin_order_cancel(req.body, function(err, ordercancel) {
    if (err) res.send(err);
    res.send(ordercancel);
  });
};

exports.order_delivery_status = function(req, res) {
  if (req.body.orderstatus === 6 || req.body.orderstatus === "6") {
    Order.order_delivery_status_by_moveituser(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  } else {
    res.status(400).send({ error: true, message: "Invalid Delivery status" });
  }
};

exports.moveit_kitchen_reached = function(req, res) {
  Order.moveit_kitchen_reached_status(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.moveit_kitchen_qualitycheck = function(req, res) {
  var kitchenquality = new Order(req.body);

  //handles null error
  if (
    !kitchenquality.moveit_userid ||
    !kitchenquality.orderid ||
    !kitchenquality.makeit_user_id ||
    !kitchenquality.enabled
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide moveit_userid/orderid/makeit_user_id/enabled"
      });
  } else {
    Order.create_moveit_kitchen_qualitycheck(kitchenquality, function(
      err,
      result
    ) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.order_payment_status = function(req, res) {
  Order.order_payment_status_by_moveituser(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderhistory_by_moveit_userid = function(req, res) {
  Order.orderhistorybymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.online_order_place_conformation = function(req, res) {
  // var order_place = new Order(req.body);
  console.log(req.body);
  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else if (!req.body.payment_status) {
    res.status(400).send({ error: true,status:false, message: "Please provide payment_status" });
  }else if (!req.body.transactionid) {
    res.status(400).send({ error: true,status:false, message: "Please provide transactionid" });
  } else {
    Order.online_order_place_conformation(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.live_order_list_byeatuser = function(req, res) {
  Order.live_order_list_byeatuserid(req.params, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.testPush = function(req, res) {
  console.log(req.body);
  Order.test_push(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_proceed_to_pay = function(req, res) {
  //console.log(req.body);
  var orderitems = req.body.orderitems;
  if (!req.body.aid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide Address Id"
      });
  } else if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.read_a_proceed_to_pay(req.body, orderitems, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.eat_order_cancel = function(req, res) {
  if (!req.body.orderid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide orderid" });
  }
   else {
    Order.eat_order_cancel(req.body, function(err, ordercancel) {
      if (err) res.send(err);
      res.send(ordercancel);
    });
  }
};

exports.makeit_order_cancel = function(req, res) {
   if (!req.body.orderid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide orderid" });
  }
   else {
    Order.makeit_order_cancel(req.body, function(err, ordercancel) {
      if (err) res.send(err);
      res.send(ordercancel);
    });
  }
};

exports.makeit_order_accept = function(req, res) {
  if (!req.body.orderid) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   Order.makeit_order_accept(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};
//refund creation
exports.eat_order_missing = function(req, res) {
  
  if (!req.body.orderid) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
    console.log(req.body);
   Order.eat_order_missing_byuserid(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};


exports.makeit_order_missing = function(req, res) {
  if (!req.body.orderid) {
   res
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   Order.order_missing_by_makeit(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};


exports.order_waiting_list_by_admin = function(req, res) {
  Order.get_order_waiting_list(req.params, function(err, waitinglist) {
    if (err) res.send(err);
    res.send(waitinglist);
  });
};


exports.moveit_delivery_cash_received_by_today = function(req, res) {
  console.log(req.body);
  Order.moveit_delivery_cash_received_by_today_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.getTotalAmountofOrders = function(req, res) {
  console.log(req.body);
  Order.get_orders_cash_online_amount(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};