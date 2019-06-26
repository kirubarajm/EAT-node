"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var admindashboardModel = function(admindashboard) {
  // this.orderid = admindashboard.orderid;
  // this.original_amt = admindashboard.original_amt;
  // this.refund_amt = admindashboard.refund_amt ;
  // this.active_status = admindashboard.active_status;
  // this.refund_amt =admindashboard.refund_amt;
  // this.userid =admindashboard.userid;
  // this.payment_id =admindashboard.payment_id;
};


admindashboardModel.get_all_dashboard_count_by_admin = async function get_all_dashboard_count_by_admin(result) {
  

        var new_sales_appointment_count = await query("Select count(aid) as new_sales_appointment_count  From Allocation where DATE(booking_date_time) = CURDATE() and status =1"); 
     
        var product_approved_count = await query("Select count(productid)as product_approved_count from Product  where delete_status !=1 and active_status !=1 and approved_status != 2  and approved_status != 3 "); 
   
        console.log(product_approved_count);


        let resobj = {  
            success: true,
            status:true,
            result: product_approved_count
          };
          result(null, resobj);
   
};




module.exports = admindashboardModel;
