"user strict";
var sql = require("../db.js");

//Task object constructor
var Zendeskissues = function(zendeskissues) {
  this.active_status = zendeskissues.active_status;
  this.issues = zendeskissues.issues;
  this.type = zendeskissues.type;
  this.department = zendeskissues.department;
  this.tid = zendeskissues.tid;
};

Zendeskissues.createZendeskissues = function createZendeskissues(req, result) {
  sql.query("INSERT INTO Zendesk_issues  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Region created successfully"
      };
      result(null, resobj);
    }
  });
};



Zendeskissues.getZendeskissuesDetails = function getZendeskissuesDetails(req,result) {
    sql.query("Select zi.id,zi.issues,zi.type,zi.department,zi.tid,zt.tag_name from Zendesk_issues zi join Zendesk_tag zt on zt.tid=zi.tid where zi.active_status=1 and zi.id='"+req.id+"'", function(err, res) {
      if (err) {
        result(err, null);
      } else {

        if (req.orderid) {
            res[0].note = "orderdetails :https://eatalltime.global/eatadmin/vieworder/"+req.orderid
        }

        if (req.userid) {
            res[0].note = res[0].note +', userdetails :https://eatalltime.global/eatadmin/vieweatuser/'+req.userid
        }
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    });
  };

Zendeskissues.getZendeskissues = function getZendeskissues(req,result) {
  sql.query("Select zi.id,zi.issues,zi.type,zi.department,zi.tid,zt.tag_name from Zendesk_issues zi join Zendesk_tag zt on zt.tid=zi.tid where zi.active_status=1 and zi.type='"+req.type+"'", function(err, res) {
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



module.exports = Zendeskissues;
