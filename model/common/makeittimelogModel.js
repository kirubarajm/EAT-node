"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var constant = require("../constant.js");
var moment = require("moment");
//Task object constructor
var Makeittimelog = function(makeittimelog) {
  this.type       = makeittimelog.type;
  this.makeit_id  = makeittimelog.makeit_id; 

  var current_day = moment().format("YYYY-MM-DD HH:mm:ss");
  var current_hour = moment(current_day).format("HH");
  var current_min  = moment(current_day).format("mm");
  if(current_min <= 50 ){
    this.created_at = moment().format("YYYY-MM-DD "+current_hour+":00:00");  
  }else{
    this.created_at = moment().format("YYYY-MM-DD "+current_hour+":59:59"); 
  }
   
};

Makeittimelog.createmakeittimelog =async function createmakeittimelog(req,result) { 
  console.log("req -->",req);
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle   = constant.dinnercycle;
  var lunchcycle    = constant.lunchcycle;                              
  var day           = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour   = moment(day).format("HH");
  var timequery     = '';

  if(currenthour >= 8 && currenthour <= 23){    
    if (currenthour < lunchcycle) {
      timequery = timequery + "(time(created_at)>='08:00:00' AND time(created_at)<='12:00:00') AND date(created_at)=CURDATE()";
    }else if(currenthour >= lunchcycle && currenthour < dinnercycle){        
      timequery = timequery + "(time(created_at)>='12:00:00' AND time(created_at)<='16:00:00') AND date(created_at)=CURDATE()";        
    }else if( currenthour >= dinnercycle){        
      timequery = timequery + "(time(created_at)>='16:00:00' AND time(created_at)<='23:00:00') AND date(created_at)=CURDATE()";
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
  }
};

module.exports = Makeittimelog;