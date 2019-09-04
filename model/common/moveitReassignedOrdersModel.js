"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var MoveitReassignedOrders = function(moveitReassignedorders) {
  this.orderid = moveitReassignedorders.orderid;
  this.moveit_userid = moveitReassignedorders.moveit_userid;
  this.notification_time = moveitReassignedorders.notification_time ;
  this.accept_time = moveitReassignedorders.accept_time;
  this.reason = moveitReassignedorders.reason;
};

MoveitReassignedOrders.createMoveitReassignedOrders = async function createMoveitReassignedOrders(req, result) {

    sql.query("INSERT INTO MoveitReassignedOrders  set ?", req, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Reassigned Orders successfully"
          };
    
          result(null, resobj);
        }
      });
  
};





module.exports = MoveitReassignedOrders;
