"user strict";
var sql = require("../db.js");

//Task object constructor
var Region = function(region) {
  this.regionname = region.regionname;
  this.stateid=region.stateid;
  this.lat=region.lat;
  this.lon=region.lon;
  this.region_image=region.region_image;
  this.region_title=region.region_title;
  this.region_content=region.region_content;
  this.region_detail_image=region.region_detail_image;
  // this.created_at = new Date();
};

Region.createRegion = function createRegion(req, result) {
  sql.query("INSERT INTO Region  set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let message = "Region created successfully";
      let resobj = {
        success: sucobj,
        message: message
      };

      result(null, resobj);
    }
  });
};

Region.read_a_question_id = function read_a_question_id(req, result) {
  var query = "Select * from Region where type = '" + req.type + "'";

  if (req.type && req.userid) {
    query = query + " and userid = '" + req.userid + "'";
  }
  query = query + "order by qid desc";

  console.log(query);

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        //res[i].count = count;
      }

      let sucobj = true;
      let resobj = {
        sucobj: sucobj,
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
  sql.query("Select regionid,regionname from Region", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
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
