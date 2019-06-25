"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var admindashboardModel = function(refund) {
  this.orderid = refund.orderid;
  this.original_amt = refund.original_amt;
  this.refund_amt = refund.refund_amt ;
  this.active_status = refund.active_status;
  this.refund_amt =refund.refund_amt;
  this.userid =refund.userid;
  this.payment_id =refund.payment_id;
};


admindashboardModel.get_all_dashboard_count_by_admin = async function get_all_dashboard_count_by_admin(req, result) {
  

        var newallocationlist = await query("Select count(aid) as newallocationcount  From Allocation where DATE(booking_date_time) = CURDATE() and status =1"); 
     
        console.log(newallocationlist);


        let resobj = {
            success: true,
            status:true,
            result: newallocationlist
          };
          result(null, resobj);
   
};


module.exports = admindashboardModel;
