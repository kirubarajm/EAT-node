'user strict';
var sql = require('../db.js');
var Orderitem = require('../../model/common/orderItemsModel.js');
//Task object constructor
var Order = function (order) {
    this.userid = order.userid;
    this.ordertime = new Date();
    this.locality = order.locality;
    this.delivery_charge = order.delivery_charge;
    this.ordertype = order.ordertype||0;
    this.orderstatus = order.orderstatus ||0;
    this.gst = order.gst;
    this.vocher = order.vocher;
    this.payment_type = order.payment_type;
    this.makeit_user_id = order.makeit_user_id;
    this.moveit_user_id = order.moveit_user_id ||0;
    this.cus_lat = order.cus_lat;
    this.cus_lon = order.cus_lon;
    this.makeit_status = order.makeit_status || '0';
  //  this.moveit_status = order.moveit_status || '0';
    this.moveit_expected_delivered_time = order.moveit_expected_delivered_time;
    this.moveit_actual_delivered_time = order.moveit_actual_delivered_time;
    this.moveit_remarks_order = order.moveit_remarks_order;
    this.makeit_expected_delivered_time = order.makeit_expected_delivered_time;
    this.makeit_actual_delivered_time = order.moveit_actual_delivered_time;
    this.created_at = new Date();
    this.price = order.price;
    this.payment_status = order.payment_status;
    this.cus_address = order.cus_address;
};


Order.createOrder = function createOrder(newOrder, orderItems, res) {


    sql.query("INSERT INTO Orders set ?", newOrder, function (err, res1) {

        if (err) {
            console.log("error: ", err);
            res(null, err);
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

              let sucobj=true;
              let mesobj = "Order Created successfully";
              let resobj = {  
                success: sucobj,
                message:mesobj,
                orderid: orderid
                }; 
        res(null, resobj);



    });


};


Order.getOrderById = function getOrderById(orderid, result) {
    sql.query("Select * from Orders where orderid = ? ", orderid, function (err, res) {
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
    sql.query("Select * from Orders", function (err, res) {

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
    sql.query("Select * from Orders where virtual=0", function (err, res) {

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
    console.log('test');
    sql.query("UPDATE Orders SET moveit_user_id = ? WHERE orderid = ?", [id, id], function (err, res) {
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
    sql.query("DELETE FROM Orders WHERE orderid = ?", [id], function (err, res) {

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
    
};



Order.order_assign = function (req, result) {
     
    sql.query("Select online_status From MoveitUser where userid= '"+req.moveit_user_id+"' ", function (err, res1) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
                    
                 var  online_status = res1[0].online_status
                // console.log(online_status);
                if(online_status == 1 || !online_status){
                    sql.query("UPDATE Orders SET moveit_user_id = ? WHERE orderid = ?", [req.moveit_user_id,req.orderid], function (err, res) {
        
                        if(err) {
                            console.log("error: ", err);
                            result(null, err);
                        }
                        else{
                            
                            let sucobj=true;
                            let message = "Order Assign Sucessfully";
                            let resobj = {  
                              success: sucobj,
                              message:message,
                             
                              }; 
                  
                           result(null, resobj);
                        }
                    });
        }else{

                    let sucobj=true;
                    let message = "Move it user is offline";
                    let resobj = {  
                      success: sucobj,
                      message:message,
                     
                      }; 
          
                   result(null, resobj);
        }
        }
    });
        

    
};


Order.getUnassignorders = function getUnassignorders(result) {

   /// Select * from Orders as ors left join User as us on ors.userid=us .userid where ors.moveit_status = '0';
   // sql.query("Select * from Orders where moveit_status = '0' ", function (err, res) {

        sql.query("Select * from Orders as ors left join User as us on ors.userid=us.userid where ors.moveit_user_id = 0", function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
            console.log(res);
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              result: res 
              }; 
  
           result(null, resobj);
        }
    });
};



Order.orderlistbymoveituserid = function(moveit_user_id, result){
    
    var query = "select * from Orders WHERE moveit_user_id  = '"+moveit_user_id+"'";

    
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
};





Order.orderviewbymoveituser = function(orderid, result){
     
               // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
                 sql.query("select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" + orderid +"'", function (err, responce) {
             
                    if(err) {
                        console.log("error: ", err);
                        result(null, err);
                    }
                    else{
                      
                     
                      let sucobj=true;
                      let resobj = {  
                      success: sucobj,
                      res: responce
                      }; 
          
                     result(null, resobj);
                    }   
                });
            
         
    };



    Order.order_pickup_status_by_moveituser = function (req,  result) {
     

        sql.query("Select * from Orders where orderid = ?",[req.orderid], function (err, res1) {

            if (err) {
                console.log("error: ", err);
                result(null, err);
            }
            else {
                
                  var  getmoveitid = res1[0].moveit_user_id;

                  console.log(getmoveitid);

                  if(getmoveitid === req.moveit_user_id ){

                    sql.query("UPDATE Orders SET orderstatus = ? WHERE orderid = ? and moveit_user_id =?", [req.orderstatus, req.orderid, req.moveit_user_id], function (err, res) {
                        if(err) {
                            console.log("error: ", err);
                            result(null, err);
                        }
                        else{
                          
                         
                          let sucobj=true;
                          let message = "Order Pickedup successfully";
                          let resobj = {  
                          success: sucobj,
                          message:message,
                          res: res
                          }; 
              
                         result(null, resobj);
                        }   
                    });

                  }else{
                    let sucobj=true;
                    let message = "Following order is not assigned to you!";
                    let resobj = {  
                    success: sucobj,
                    message:message,
                    
                    }; 
        
                   result(null, resobj);
                  }



            }
        });


        
       
    };
    

module.exports = Order;