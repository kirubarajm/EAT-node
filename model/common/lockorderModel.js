'user strict';
var sql = require('../db.js');

//Task object constructor
var Orderlock = function (orderlock) {
    this.orderid = orderlock.orderid;
    this.productid = orderlock.productid;
    this.quality = orderlock.quality;
    this.created_at = new Date();
    //this.price = orderlock.price;

};

Orderlock.createOrderitems = function createOrderitems(order_item, res) {

    sql.query("INSERT INTO Lock_order set ?", order_item, function (err, result) {
        if (err) {
            console.log("error: ", err);
            res(null, err);
        } else {
            var orderlockid = res1.insertId
            let sucobj=true;
              let resobj = {  
                success: sucobj,
                orderlockid: orderlockid
                }; 

            res(null, resobj);

        }
    });

};

module.exports = Orderlock;