"user strict";
var sql = require("../db.js");


//Task object constructor
var Zone = function(zone) {
  this.Zonename = zone.Zonename;
  this.boundaries=region.boundaries;
};

Zone.createZone = function createZone(req, result) {
  sql.query("INSERT INTO Zone  set ?", req, function(err, res) {
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

  if (req.boundaries) {
    query = query + " where boundaries not null";
  }
  sql.query(query, function(err, res) {
    if (err) {
      result(err, null);
    } else {
     
      let sucobj = true;
      let resobj = {
        sucobj: sucobj,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Region.getRegionByType = function getRegionByType(id, result) {
  sql.query("Select * from Region where type = ? ", id, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Region.getAllregion = function getAllregion(result) {
  var regionquery = "Select regionid,regionname from Region where active_status = 1";
  //var regionquery = "Select * from Region";
  sql.query(regionquery, function(err, res) {
    if (err) {
      result(err, null);
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

Region.procall = function procall(req, result) {
  sql.query("CALL `eattovo`.`eatusers`()", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      console.log("resobj: ", resobj);
      result(null, resobj);
    }
  });
};

Region.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Region SET task = ? WHERE faqid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

Region.remove = function(id, result) {
  sql.query("DELETE FROM Query_questions WHERE faqid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};
module.exports = Region;
