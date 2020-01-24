"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var constant = require("../constant.js");
var moment = require("moment");
//Task object constructor
var Makeittimelog = function(makeittimelog) {
  this.type         = makeittimelog.type;
  this.makeit_id = makeittimelog.makeit_id;  
};

Makeittimelog.createmakeittimelog =async function createmakeittimelog(req,result) { 
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle   = constant.dinnercycle;
  var lunchcycle    = constant.lunchcycle;                              
  var day           = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour   = moment(day).format("HH");
  var timequery     = '';

  if (currenthour < lunchcycle) {
    timequery = timequery + "(time(created_at)>='08:00:00' AND time(created_at)<='12:00:00')";
  }else if(currenthour >= lunchcycle && currenthour < dinnercycle){        
    timequery = timequery + "(time(created_at)>='12:00:00' AND time(created_at)<='16:00:00')";        
  }else if( currenthour >= dinnercycle){        
    timequery = timequery + "(time(created_at)>='16:00:00' AND time(created_at)<='23:00:00')";
  }

  var Makeittimelogquery = await query("select * from Makeit_Timelog where makeit_id="+req.makeit_id+" and "+timequery+" order by id desc limit 1");
  
  if((Makeittimelogquery.length==0 && req.type==1) || (Makeittimelogquery.length !=0 && Makeittimelogquery[0].type==0 && req.type==1)){
    sql.query("INSERT INTO Makeit_Timelog  set ?", req, function(err, res) {
      if (err) {
        //result(err, null);
        console.log("err",err);
      } else {
        console.log("Makeit time log in created successfully");
      }
    });
  }else if((Makeittimelogquery.length !=0 && Makeittimelogquery[0].type==1) || (Makeittimelogquery.length !=0 && Makeittimelogquery[0].type==1 && req.type==0) ) {
    if(req.type==0){
      sql.query("INSERT INTO Makeit_Timelog  set ?", req, function(err, res) {
        if (err) {
          //result(err, null);
          console.log("err",err);
        } else {
          console.log("Makeit time log out created successfully");
        }
      });
    }    
  }  
};

module.exports = Makeittimelog;