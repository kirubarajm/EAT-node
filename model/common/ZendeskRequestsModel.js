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

Zendeskrequest.createZendeskrequest =async function createZendeskrequest(req, result) {

 //   console.log("---------------->new_zendesk_request_create",req);

var get_zendesk= await query("select * from Zendesk_chat_requests where orderid= "+req.orderid+"  and issueid= "+req.issueid+"  ")

var get_ticketid= await query("select * from Zendesk_chat_requests where orderid= "+req.orderid+"  order by id desc limit 1  ")

    if (get_zendesk.length==0) {

        if (get_ticketid.length !=0) {
            
            req.ticketid = get_ticketid[0].ticketid;
        }

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
    }
  
};



module.exports = Zendeskrequest;
