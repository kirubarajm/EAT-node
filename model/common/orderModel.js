'user strict';
var sql = require('../db.js');

//Task object constructor
var Order = function(order){
    this.userid = order.userid;
    this.ordertime=order.ordertime;
    this.locality=order.locality;
    this.delivery_charge=order.delivery_charge;
    this.ordertype=order.ordertype;
    this.orderstatus=order.orderstatus;
    this.gst=order.gst;
    this.vocher=order.vocher;
    this.payment_type = order.payment_type; 
    this.makeit_userid = order.makeit_userid; 
    this.moveit_userid = order.moveit_userid; 
    this.cus_lat = order.cus_lat; 
    this.cus_lon = order.cus_lon; 
    this.makeit_status = order.makeit_status; 
    this.moveit_status = order.moveit_status; 
    this.moveit_expected_delivered_time = order.moveit_expected_delivered_time; 
    this.moveit_actual_delivered_time = order.moveit_actual_delivered_time; 
    this.moveit_remarks_order = order.moveit_remarks_order; 
    this.makeit_expected_delivered_time = order.makeit_expected_delivered_time; 
    this.makeit_actual_delivered_time = order.moveit_actual_delivered_time; 
    this.created_at = new Date();
};


Order.createOrder = function createOrder(newOrder, result) {    
        sql.query("INSERT INTO Order set ?", newOrder, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    result(null, res.insertId);
                }
            });           
};

Order.getOrderById = function getOrderById(orderid, result) {
        sql.query("Select * from Order where orderid = ? ", orderid, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Order.getAllOrder = function getAllOrder(result) {
        sql.query("Select * from Order", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Order : ', res);  

                 result(null, res);
                }
            });   
};

Order.getAllVirtualOrder = function getAllVirtualOrder(result) {
        sql.query("Select * from Order where virtual=0", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Order : ', res);  

                 result(null, res);
                }
            });   
};

Order.updateById = function(id, user, result){
  sql.query("UPDATE Order SET task = ? WHERE orderid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Order.remove = function(id, result){
     sql.query("DELETE FROM Order WHERE orderid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

module.exports= Order;