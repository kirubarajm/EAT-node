'user strict';
var sql = require('../db.js');

//Task object constructor
var Orderitems = function (orderitems) {
    this.productid = orderitems.productid;
    this.quantity = orderitems.quantity;
    this.gst = orderitems.gst;
    this.created_at = new Date();
    this.price = orderitems.price;
    this.orderid = orderitems.orderid;

};

Orderitems.createOrderitems = function createOrderitems(order_item, res) {

    sql.query("INSERT INTO OrderItem set ?", order_item, function (err, result) {
        if (err) {
            console.log("error: ", err);
            res(null, err);
        } else {

            let sucobj=true;
              let mesobj = "Order Item Created successfully";
              let resobj = {  
                success: sucobj,
                message:mesobj,
               // orderid: orderid
                }; 

            res(null, resobj);

        }
    });

};

module.exports = Orderitems;