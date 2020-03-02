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


module.exports= ZendeskWebhook;