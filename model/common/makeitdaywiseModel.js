"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitdaywise = function(makeitdaywise) {
  this.date         = makeitdaywise.log_date;
  this.makeit_id = makeitdaywise.makeit_id;
  this.cycle1       = makeitdaywise.cycle1;
  this.cycle2       = makeitdaywise.cycle2;
  this.cycle3       = makeitdaywise.cycle3;
  this.logtime      = makeitdaywise.logtime;
  this.order_count  = makeitdaywise.order_count;
  this.breakfast    = makeitdaywise.breakfast;
  this.lunch        = makeitdaywise.lunch;
  this.dinner       = makeitdaywise.dinner; 
};

Makeitdaywise.createmakeitdaywise = function createmakeitdaywise(req) {
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