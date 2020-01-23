"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var Makeittimelog = function(makeittimelog) {
  this.type         = makeittimelog.type;
  this.makeit_id = makeittimelog.makeit_id;  
};

Makeittimelog.createmakeittimelog =async function createmakeittimelog(req,result) {

  var Makeittimelogquery = await query("select * from Makeit_Timelog where makeit_id="+req.makeit_id+" and DATE(created_at) = CURDATE() order by id desc limit 1");
 
  if ((Makeittimelogquery.length==0 && req.type==1) || (Makeittimelogquery.length !=0 && Makeittimelogquery[0].type==0)) {
    sql.query("INSERT INTO Makeit_Timelog  set ?", req, function(err, res) {
      if (err) {
        //result(err, null);
        console.log("err",err);
      } else {
        console.log("Makeit time log created successfully");
        // let resobj = {
        //   success: true,
        //   status:true,
        //   message: "Makeit time log created successfully"
        // };
        // result(null, resobj);
      }
    });
  }else if(Makeittimelogquery.length !=0 && req.type==0 || (Makeittimelogquery.length !=0 &&Makeittimelogquery[0].type==1)) {
    sql.query("INSERT INTO Makeit_Timelog  set ?", req, function(err, res) {
      if (err) {
        //result(err, null);
        console.log("err",err);
      } else {
        console.log("Makeit time log created successfully");
        // let resobj = {
        //   success: true,
        //   status:true,
        //   message: "Makeit time log created successfully"
        // };
        // result(null, resobj);
      }
    });
  }
  
};


module.exports = Makeittimelog;