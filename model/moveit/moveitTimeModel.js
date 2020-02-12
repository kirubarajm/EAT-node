'user strict';
var sql     = require('../db.js');
var request = require("request");
var Constant  = require("../constant")
const util  = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var constant  = require('../constant.js');
var moment  = require("moment");

//Task object constructor
var MoveitTimelog = function (moveittimelog) {
    this.logtime  = moveittimelog.logtime || moment().format("YYYY-MM-DD HH:mm:ss");
    this.type     = moveittimelog.type || 0;
    this.lat      = moveittimelog.lat;
    this.lon      = moveittimelog.lon;
    this.moveit_userid = moveittimelog.moveit_userid;
    this.action   = moveittimelog.action;
    this.created_at = moveittimelog.created_at || moment().format("YYYY-MM-DD HH:mm:ss");   
    this.logtime  = moveittimelog.logtime || moment().format("YYYY-MM-DD HH:mm:ss");
};

MoveitTimelog.createMoveitTimelog = async function createMoveitTimelog(newMoveitTimelog, result) {
  var Moveittimelog= await query("select * from Moveit_Timelog where moveit_userid="+newMoveitTimelog.moveit_userid+" and date(created_at)=CURDATE() order by mt_id desc limit 1");
  //console.log("Moveittimelog -->",Moveittimelog); 
  
  if(Moveittimelog.length == 0){
    Moveittimelog.push({"type":0});
  }

  //console.log("req",newMoveitTimelog.type,"-->query",Moveittimelog[0].type);
  if(newMoveitTimelog.type != Moveittimelog[0].type){
    sql.query("INSERT INTO Moveit_Timelog set ?", newMoveitTimelog, function (err, res1) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status : true,
          message: 'Moveit Timelog  created successfully',
          id: res1.insertId
        };
        result(null, resobj);
      }
    }); 
  }else{
    var logstatus = "";
    if(Moveittimelog[0].type == 1){
      logstatus ="online";
    }else{
      logstatus ="offline";
    }

    let resobj = {      
      success: true,
      status : true,
      message: 'user already in '+logstatus,
    };
    result(null, resobj);
  }
};

module.exports = MoveitTimelog;