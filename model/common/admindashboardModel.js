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
  
  try {
    
 
          var countlist = {};
        //makeit allocated count
        var new_sales_appointment_count = await query("Select count(aid) as count  From Allocation where DATE(booking_date_time) = CURDATE() and status =1"); 

        countlist.new_sales_appointment_count  = new_sales_appointment_count[0].count;
        //new product count
        var product_approved_count = await query("Select count(productid) as count from Product  where delete_status !=1 and active_status !=1 and approved_status != 2  and approved_status != 3 "); 
      
        countlist.product_approved_count  = product_approved_count[0].count;
        //new  new queries
        var  new_queries_count = await query("Select count(qid) as count from Query_questions where admin_read = 0 "); 
        countlist.new_queries_count  = new_queries_count[0].count;
          //new_replies_count
        var  new_replies_count = await query("Select count(aid) as count from Query_answers where admin_read=0"); 
        countlist.new_replies_count  = new_replies_count[0].count;
        //new order count
        var  new_order_count = await query("Select count(orderid) as count from Orders where moveit_user_id = 0 and orderstatus = 0  and cancel_by = 0"); 
        countlist.new_order_count  = new_order_count[0].count;
        //makeit order count
        var  new_makeit_cancel_order_count = await query("Select count(orderid) as count from Orders where moveit_user_id = 0 and orderstatus = 7 and cancel_by = 2 and DATE(created_at) = CURDATE()"); 
        countlist.new_order_count  = new_makeit_cancel_order_count[0].count;
        //unapproved kitchen list
        var  admin_unapproved_kitchen_count = await query("Select count(userid) as userid from MakeitUser where ka_status = 1 and virtualkey=0");
        countlist.admin_unapproved_kitchen_count  = admin_unapproved_kitchen_count[0].userid;
        console.log(countlist);


        let resobj = {  
            success: true,
            status:true,
            result: countlist
          };
          result(null, resobj);
        } catch (error) {

          let resobj = {  
            success: true,
            status:false,
            error: error
          };
          result(null, resobj);
        }
};




module.exports = admindashboardModel;
