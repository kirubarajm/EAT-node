"user strict";
var sql = require("../db.js");
var Product = require("../../model/makeit/productModel.js");

//Task object constructor
var Orderitems = function(orderitems) {
  this.productid = orderitems.productid;
  this.quantity = orderitems.quantity;
  this.gst = orderitems.gst || 0;
  // this.created_at = new Date();
  this.price = orderitems.price || 0;
  this.orderid = orderitems.orderid;
};

Orderitems.createOrderitems = function createOrderitems(order_item, res) {
  console.log(order_item);

  sql.query("INSERT INTO OrderItem set ?", order_item, function(err, result) {
    if (err) {
      console.log("error: ", err);
      res(null, err);
    } else {
      console.log("test");
      var OrderItemid = result.insertId;

      sql.query(
        "update Product set quantity= quantity-? WHERE productid = ?",
        [order_item.quantity, order_item.productid],
        function(err, res1) {
          if (err) {
            console.log("error: ", err);
            res(null, err);
          }
        }
      );

      let sucobj = true;
      let mesobj = "Order Item Created successfully";

      let resobj = {
        success: sucobj,
        message: mesobj,
        OrderItemid: OrderItemid
      };

      res(null, resobj);
    }
  });
};

Orderitems.createOrderitemsonline = function createOrderitemsonline(
  order_item,
  res
) {
  sql.query("INSERT INTO OrderItem set ?", order_item, function(err, result) {
    if (err) {
      console.log("error: ", err);
      res(null, err);
    } else {
      var OrderItemid = result.insertId;

      sql.query(
        "update Product set quantity= quantity-? WHERE productid = ?",
        [order_item.quantity, order_item.productid],
        function(err, res1) {
          if (err) {
            console.log("error: ", err);
            res(null, err);
          }
        }
      );

      let sucobj = true;
      let mesobj = "Order Item Created successfully";

      let resobj = {
        success: sucobj,
        message: mesobj,
        OrderItemid: OrderItemid
      };

      res(null, resobj);
    }
  });
};

Orderitems.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from OrderItem where orderid = ? ", orderid, function(
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

Orderitems.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from OrderItem", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Order : ", res);

      result(null, res);
    }
  });
};

Orderitems.updateById = function(id, user, result) {
  console.log("test");
  sql.query(
    "UPDATE OrderItem SET moveit_user_id = ? WHERE orderid = ?",
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

Orderitems.remove = function(id, result) {
  sql.query("DELETE FROM OrderItem WHERE orderid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
module.exports = Orderitems;
