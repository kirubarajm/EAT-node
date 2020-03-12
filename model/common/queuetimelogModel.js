"user strict";
var sql     = require("../db.js");
const util  = require("util");
const query = util.promisify(sql.query).bind(sql);
var constant = require("../constant.js");
var moment  = require("moment");

//Task object constructor
var Queuetimelog = function(queuetimelog) {
  this.type       = queuetimelog.type;
  this.zone_id    = queuetimelog.zone_id; 
};

Queuetimelog.createqueuetimelog =async function createqueuetimelog(req,result) { 
  var day            = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour    = moment(day).format("HH");
  
  if(currenthour >= 8 && currenthour <= 23){    
    var Makeittimelogquery = await query("select * from Queue_Timelog where zone_id="+req.zone_id+" and date(created_at)=CURDATE() order by id desc limit 1");
    if(req.type==1){
      if(Makeittimelogquery.length ==0 && req.type ==1){
        sql.query("INSERT INTO Queue_Timelog  set ?", req, function(err, res) {
          if (err) {
            //result(err, null);
            console.log("err",err);
          } else {
            console.log("Queue time log in created successfully");
          }
        });
      }else if(Makeittimelogquery.length !=0 && (Makeittimelogquery[0].type ==0 && req.type ==1)){
        sql.query("INSERT INTO Queue_Timelog  set ?", req, function(err, res) {
          if (err) {
            //result(err, null);
            console.log("err",err);
          } else {
            console.log("Queue time log in created successfully");
          }
        });
      }else{
        console.log("default else");        
      }
    }else{
      if((Makeittimelogquery.length !=0) && (Makeittimelogquery[0].type == 1 && req.type == 0)){
        sql.query("INSERT INTO Queue_Timelog  set ?", req, function(err, res) {
          if (err) {
            //result(err, null);
            console.log("err",err);
          } else {
            console.log("Queue time log out created successfully");
          }
        });
      }else{
        console.log("Already Queue was logged out");
      }
    } 
  }
};

module.exports = Queuetimelog;