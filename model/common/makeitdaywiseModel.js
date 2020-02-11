"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitdaywise = function(makeitdaywise) {
  this.date         = makeitdaywise.log_date;
  this.makeit_id    = makeitdaywise.makeit_id;
  this.cycle1       = makeitdaywise.cycle1;
  this.cycle2       = makeitdaywise.cycle2;
  this.cycle3       = makeitdaywise.cycle3;
  this.logtime      = makeitdaywise.logtime;
  this.order_count  = makeitdaywise.order_count;
  this.breakfast_completed = makeitdaywise.breakfast_completed;
  this.lunch_completed     = makeitdaywise.lunch_completed;
  this.dinner_completed    = makeitdaywise.dinner_completed; 
  this.breakfast_canceled  = makeitdaywise.breakfast_canceled;
  this.lunch_canceled      = makeitdaywise.lunch_canceled;
  this.dinner_canceled     = makeitdaywise.dinner_canceled; 
  this.cycle_count      = makeitdaywise.cycle_count; 
  this.breakfast_count  = makeitdaywise.breakfast_count;
  this.lunch_count      = makeitdaywise.lunch_count;
  this.dinner_count     = makeitdaywise.dinner_count; 
  this.total_makeit_earnings = makeitdaywise.total_makeit_earnings;
  this.breakfast_total_makeit_earnings = makeitdaywise.breakfast_total_makeit_earnings;
  this.lunch_total_makeit_earnings = makeitdaywise.lunch_total_makeit_earnings;
  this.dinner_total_makeit_earnings = makeitdaywise.dinner_total_makeit_earnings;
  this.complete_succession_count = makeitdaywise.complete_succession_count;
  this.cancel_order_count = makeitdaywise.cancel_order_count;
  this.kitchen_percentage = makeitdaywise.kitchen_percentage;
};

Makeitdaywise.createmakeitdaywise = function createmakeitdaywise(req,result) {

  console.log("report------------------>",req);
  sql.query("INSERT INTO Makeit_daywise_report  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Makeit daywise created successfully"
      };
      //result(null, resobj);
    }
  });  
};

module.exports = Makeitdaywise;