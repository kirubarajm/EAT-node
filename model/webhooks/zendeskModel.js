'user strict';
var sql = require('../db.js');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var razorpayconst = require('../razorpay_constant');
var constant = require('../constant');
var Notification = require('../common/notificationModel');
var PushConstant = require("../../push/PushConstant.js");
var Razorpay = require("razorpay");
var Onlineautorefund = require('../common/Online_autorefundModel.js');
//Task object constructor
var ZendeskWebhook = function(zendeskWebhook){
    this.payment_id = zendeskWebhook.payment_id || 0;
    this.orderid = zendeskWebhook.orderid || 0;
    this.razorpay_response = zendeskWebhook.razorpay_response;
    this.amount = zendeskWebhook.amount || 0;
    this.payment_type = zendeskWebhook.payment_type || 0;
};


ZendeskWebhook.zendeskWebhookSendNotification =async function zendeskWebhookSendNotification(req, result) {

    
    await Notification.zendeskPushNotification(
        req,
        PushConstant.Pageid_eat_zendesk_notification
      );

      let resobj = {
        success: true,
        message: "Notication send successfully",
        status:true
      };
      
      
      ////////////////////////////
      result(null, resobj);


};

ZendeskWebhook.ZendeskController_webhooks_tickets =async function ZendeskController_webhooks_tickets(req, result) {
  var ticketid = req.tid;
  var getUrl="api/v2/tickets/"+ticketid+".json"
  var ticketURL=constant.zendesk_url+getUrl;
  console.log("ticketURL-->",ticketURL);
  
  //var auth = "Basic " + new Buffer(constant.Username + ":" + constant.Password).toString("base64");
//   var auth={
//   'user': constant.Username,
//   'pass': constant.Password,
//   'sendImmediately': true
// }
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':"Basic dG92b2xvZ2llc0BnbWFpbC5jb206VGVtcHRvdm8="
  };
  

  request.get({headers: headers,url:ticketURL,method: 'GET'},async function (e, r, body) {
    console.log("e--",e);
    //console.log("body--",body);
    var data = body;
    try {
      var data = JSON.parse(body);
    } catch (e) {
        console.log("e--",e);
    }
   
    var isResponse=false;
    if(data.ticket){
      var zendesk_userid=data.ticket.requester_id;
      console.log("zendesk_userid-->",zendesk_userid);
      var get_zendesk_chat_query="select id,orderid,issueid from Zendesk_chat_requests where zendeskuserid= "+zendesk_userid +" order by id desc LIMIT 1";
      var get_zendesk_chat=await query(get_zendesk_chat_query);
      console.log("get_zendesk_chat_query-->",get_zendesk_chat);
      if(get_zendesk_chat.length>0){
       
        var updateTicketQuery="update Zendesk_chat_requests set ticketid= "+ticketid+" where id= "+get_zendesk_chat[0].id; 
        console.log("updateTicketQuery-->",updateTicketQuery);
        var update_ticket=await query(updateTicketQuery);

        var updateOrderQuery="update Orders set zendesk_ticketid= "+ticketid+" where orderid= "+get_zendesk_chat[0].orderid; 
        var update_orders=await query(updateOrderQuery);
        console.log("updateOrderQuery-->",updateOrderQuery);

        // var select_tags_query= "select tag_name from Zendesk_issues zi left join Zendesk_tag zt on zt.tid=zi.tid where tid in("+get_zendesk_chat_id[0].issueid+")"
        // var select_tags= await query(select_tags_query);

        // console.log("select_tags e--",select_tags);

        // if(select_tags.length>0){
        //   var userdetails={
        //       ticket:{
        //         tags: [select_tags]
        //       }
        //   }
        //   request.put({headers: headers, url:ticketURL, json: userdetails,method: 'PUT'},async function (e, r, body) {
        //       console.log("tags e--",e);
        //       console.log("tags body--",body);
        //   });
        // }
        
        isResponse=true;
      }
      
    }
      
      var resobj={
        success:true,
        status:isResponse,
      }

      result(null, resobj);
    
    
  });

};

module.exports= ZendeskWebhook;