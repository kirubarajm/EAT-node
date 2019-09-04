"user strict";
//var sql = require('../db.js');
var masters_comm = require("../master.js");
var masters_eat = require("../master_eat.js");
//Task object constructor
var masters= function() {};
masters.read_a_masters = function read_a_masters(req, result) {
  let resobj = {
     success:true,
     status:true,
    result: masters_comm
  };
  result(null, resobj);
};

masters.read_eat_masters = function read_eat_masters(req, result) {
  let resobj = {
     success:true,
     status:true,
    result: masters_eat
  };
  result(null, resobj);
};

module.exports = masters;
