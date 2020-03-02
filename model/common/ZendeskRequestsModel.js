"user strict";
var sql = require("../db.js");

//Task object constructor
var Zendeskrequest = function(zendeskrequest) {
  this.orderid = zendeskrequest.orderid;
  this.userid = zendeskrequest.userid;
  this.ticketid = zendeskrequest.ticketid;
  this.zendeskuserid = zendeskrequest.zendeskuserid;
  this.type = zendeskrequest.type;
  this.app_type = zendeskrequest.app_type;
  this.tagid = zendeskrequest.tagid;
  this.issueid = zendeskrequest.issueid;
};

Zendeskrequest.createZendeskrequest = function createZendeskrequest(req, result) {

    console.log("---------------->new_zendesk_request_create",req);

  sql.query("INSERT INTO Zendesk_chat_requests  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
    //   let resobj = {
    //     success: true,
    //     status:true,
    //     message: "Zendesk requests created successfully"
    //   };
    //   result(null, resobj);
    }
  });
};



module.exports = Zendeskrequest;
