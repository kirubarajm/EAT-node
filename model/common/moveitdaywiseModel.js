"user strict";
var sql = require("../db.js");

//Task object constructor
var Moveitdaywise = function(moveitdaywise) {
  this.date         = moveitdaywise.date;
  this.moveit_userid = moveitdaywise.moveit_userid;
  this.cycle1       = moveitdaywise.cycle1;
  this.cycle2       = moveitdaywise.cycle2;
  this.cycle3       = moveitdaywise.cycle3;
  this.logtime      = moveitdaywise.logtime;
  this.order_count  = moveitdaywise.order_count;
  this.breakfast    = moveitdaywise.breakfast;
  this.lunch        = moveitdaywise.lunch;
  this.dinner       = moveitdaywise.dinner; 
};

Moveitdaywise.createmoveitdaywise = function createmoveitdaywise(req) {
  sql.query("INSERT INTO Moveit_daywise_report  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Moveit daywise created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Moveitdaywise;