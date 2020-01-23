"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeittimelog = function(makeittimelog) {
  this.type         = makeittimelog.type;
  this.makeit_id = makeittimelog.makeit_id;  
};

Makeittimelog.createmakeittimelog = function createmakeittimelog(req) {
  sql.query("INSERT INTO Makeit_Timelog  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Makeit time log created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Makeittimelog;