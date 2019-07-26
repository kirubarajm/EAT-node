"user strict";
//var sql = require('../db.js');
var masters = require("../master.js");
//Task object constructor

masters.read_a_masters = function read_a_masters(req, result) {
  console.log(masters[0]);
  let resobj = {
     success:true,
     status:true,
    result: masters
  };
  result(null, resobj);
};

module.exports = masters;
