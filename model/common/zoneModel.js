"user strict";
var sql = require("../db.js");


//Task object constructor
var Zone = function(zone) {
  this.Zonename = zone.Zonename;
  this.boundaries=region.boundaries;
};

Zone.createZone = function createZone(req, result) {
  sql.query("INSERT INTO Zone set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status : true,
        message: "Zone created successfully"
      };
      result(null, resobj);
    }
  });
};

Zone.get_all_zone = function get_all_zone(req, result) {
  var query = "Select * from Zone";

  if (req.boundaries==1) {
    query = query + " where boundaries not null";
  }else if (req.boundaries==0) {
    query = query + " where boundaries null";
  }

  sql.query(query, function(err, res) {
    if (err) {
        let resobj = {
            success: true,
            status:false,
            message:'No Boundaries Avaiable'
          };
      result(null, resobj);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};


module.exports = Zone;
