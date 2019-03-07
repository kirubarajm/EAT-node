'user strict';
var sql = require('../db.js');
var Orderitem = require('../../model/common/orderitemsModel.js');
//Task object constructor
var Order = function (order) {
    this.userid = order.userid;
    this.ordertime = order.ordertime;
    this.locality = order.locality;
    this.delivery_charge = order.delivery_charge;
    this.ordertype = order.ordertype;
    this.orderstatus = order.orderstatus;
    this.gst = order.gst;
    this.vocher = order.vocher;
    this.payment_type = order.payment_type;
    this.makeit_user_id = order.makeit_user_id;
    this.moveit_user_id = order.moveit_user_id;
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
    this.price = order.price;
};


Order.createOrder = function createOrder(newOrder, orderItems, res) {


    sql.query("INSERT INTO Orders set ?", newOrder, function (err, res1) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }

        var orderid = res1.insertId



        for (var i = 0; i < orderItems.length; i++) {
            var orderitem = new Orderitem(orderItems[i]);
            orderitem.orderid = orderid;

            Orderitem.createOrderitems(orderitem, function (err, result) {
                if (err)
                    res.send(err);
                // res.json(result);
            });

        }

        res(null, orderid);



    });


};


Order.getOrderById = function getOrderById(orderid, result) {
    sql.query("Select * from Order where orderid = ? ", orderid, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);

        }
    });
};

Order.getAllOrder = function getAllOrder(result) {
    sql.query("Select * from Order", function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('Order : ', res);

            result(null, res);
        }
    });
};

Order.getAllVirtualOrder = function getAllVirtualOrder(result) {
    sql.query("Select * from Order where virtual=0", function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('Order : ', res);

            result(null, res);
        }
    });
};

Order.updateById = function (id, user, result) {
    sql.query("UPDATE Order SET task = ? WHERE orderid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Order.remove = function (id, result) {
    sql.query("DELETE FROM Order WHERE orderid = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};

Order.get_all_orders = function get_all_orders(req,result) {
    //console.log(req);
    var query = "select od.userid,us.name,od.ordertime,od.locality,od.delivery_charge,od.ordertype,od.orderstatus,od.gst,od.vocher,od.payment_type,od.makeit_user_id,od.moveit_user_id,od.cus_lat,od.cus_lon,od.cus_address,od.makeit_status,od.moveit_status,od.price,od.payment_status from Orders od join User us on od.userid = us.userid ";
   
    var searchquery = "us.phoneno LIKE  '%"+req.search+"%' OR us.email LIKE  '%"+req.search+"%' or us.name LIKE  '%"+req.search+"%'  or od.orderid LIKE  '%"+req.search+"%'";
    if(req.virtualid !== 'all'){
        query = query+ " where us.virutal = '"+req.virtualid+"'";
       
    }
    //var search= req.search
    if(req.virtualid !== 'all' && req.search){
        query = query+" and ("+searchquery+")"
    }else if(req.search){
        query = query+" where " +searchquery
    }
    
    query=query+ " order by od.orderid desc";
    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
            
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              result: res 
              }; 
  
           result(null, resobj);
        }
    }); 
    // sql.query("Select * from User where virutal = '"+req+"'", function (err, res) {

    //         if(err) {
    //             console.log("error: ", err);
    //             result(null, err);
    //         }
    //         else{
    //           console.log('User : ', res);  

    //          result(null, res);
    //         }
    //     });   
};
module.exports = Order;