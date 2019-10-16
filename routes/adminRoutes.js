"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  var eatuser = require("../controllers/eat/EatUserController");
  var moveituser = require("../controllers/moveit/MoveitUserController");
  var makeituser = require("../controllers/makeit/MakeitUserController");
  var salesuser = require("../controllers/sales/SalesUserController");
  var documents = require("../controllers/common/DocumentsController");
  var menuitem = require("../controllers/makeit/MenuItemController");
  var product = require("../controllers/makeit/ProductController");
  var faq = require("../controllers/common/FaqController");
  var allocation = require("../controllers/sales/AllocationController");
  var orders = require("../controllers/common/OrderController");
  var moveitdocument = require("../controllers/common/DocumentmoveitController");
  var eatuseraddress = require("../controllers/eat/EatUserAddressController");
  var queryquestion = require("../controllers/common/QueryquestionController");
  var queryanswer = require("../controllers/common/QueryanswerController");
  var feedback = require("../controllers/common/EatfeedbackController");
  var refundOnline = require("../controllers/common/refundController");
  var refundcoupon = require("../controllers/common/RefundCouponController");
  var admindashboard = require("../controllers/common/admindashboardController");
  var Razorpay = require("../controllers/common/RazorpayController");
  var MakeitImages = require("../controllers/makeit/MakeitImagesController");
  var Stories = require("../controllers/common/StoryController");
  var adminController = require("../controllers/admin/adminUserController");
/*Admin Api*/
app.route("/admin/eatuser/add").post(routesVersioning({"1.0.0":eatuser.create_a_eatuser}));
app.route("/admin/eatusers/").post(routesVersioning({"1.0.0":eatuser.list_all_virtual_eatuser}));
app.route("/admin/order/add").post(routesVersioning({"1.0.0":orders.eatuser_order_create}));
app.route("/admin/orders").post(routesVersioning({"1.0.0":orders.list_all_orders}));
app.route("/admin/vorders").post(routesVersioning({"1.0.0":orders.list_today_virtual_makeit_orders}));
app.route("/admin/vorders/history").post(routesVersioning({"1.0.0":orders.list_all_virtual_makeit_orders}));
app.route("/admin/order/:id").get(routesVersioning({"1.0.0":orders.order_view}));
app.route("/admin/orderstatus/update").put(routesVersioning({"1.0.0":orders.order_status_update}));//order accept
app.route("/admin/order/assign").put(routesVersioning({"1.0.0":orders.order_assign}));
app.route("/admin/orders/unassign/:id").get(routesVersioning({"1.0.0":orders.un_assign_orders}));
app.route("/admin/product").post(routesVersioning({"1.0.0":product.admin_list_all_product}));
app.route("/admin/makeitusers").post(routesVersioning({"1.0.0":makeituser.admin_list_all_makeitusers}));
app.route("/admin/unapproved/makeitlist").post(routesVersioning({"1.0.0":makeituser.admin_makeit_unapproved_list}));
app.route("/admin/makeituser/add").post(routesVersioning({"1.0.0":makeituser.createnewUser_Admin}));
app.route("/admin/salesuser/add").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
app.route("/admin/moveituser/add").post(routesVersioning({"1.0.0":moveituser.create_a_user}));
app.route("/admin/appointments").get(routesVersioning({"1.0.0":makeituser.list_all_appointment}));
app.route("/admin/appointment/assign").post(routesVersioning({"1.0.0":allocation.create_a_allocation}));
app.route("/admin/moveit/nearbyuser").post(routesVersioning({"1.0.0":moveituser.getNearByMoveit}));
app.route("/admin/eatuser/:userid").get(routesVersioning({"1.0.0":eatuser.read_a_user})).put(routesVersioning({"1.0.0":eatuser.update_a_user})).delete(routesVersioning({"1.0.0":eatuser.delete_a_user}));
app.route("/admin/makeituser/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user})).delete(routesVersioning({"1.0.0":makeituser.delete_a_user}));
app.route("/admin/salesusers").post(routesVersioning({"1.0.0":salesuser.salesSearch,"2.0.0": salesuser.salesSearch_V2}));
app.route("/admin/moveitusers").post(routesVersioning({"1.0.0":moveituser.moveitSearch}));
app.route("/admin/salesuser/:userid").get(routesVersioning({"1.0.0":salesuser.read_a_user})).delete(routesVersioning({"1.0.0":salesuser.delete_a_user}));
app.route("/admin/moveituser/:userid").get(routesVersioning({"1.0.0":moveituser.admin_read_a_user})).delete(routesVersioning({"1.0.0":moveituser.delete_a_user}));
app.route("/admin/sales/documentupload").post(routesVersioning({"1.0.0":documents.sales_upload_a_documents}));
app.route("/admin/moveit/documentupload").post(routesVersioning({"1.0.0":documents.moveit_upload_a_documents}));
app.route("/admin/makeit/documentupload").post(routesVersioning({"1.0.0":documents.makeit_upload_a_documents}));
app.route("/admin/moveit/documentstore").post(routesVersioning({"1.0.0":moveitdocument.create_a_documents}));
app.route("/admin/menuitem/add").post(routesVersioning({"1.0.0":menuitem.create_a_menuitem}));
app.route("/admin/menuitem/view/:id").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem}));
app.route("/admin/product/add").post(routesVersioning({"1.0.0":product.create_a_product}));
app.route("/admin/liveproduct/:makeit_userid").get(routesVersioning({"1.0.0":product.list_all_liveproduct}));
app.route("/admin/product/view/:productid").get(routesVersioning({"1.0.0":product.productview}));
app.route("/admin/product/movetolive").post(routesVersioning({"1.0.0":product.add_quantity_productlive}));
app.route("/admin/makeituser/edit").put(routesVersioning({"1.0.0":makeituser.edit_makeit_user_byid}));
app.route("/admin/moveituser/edit").put(routesVersioning({"1.0.0":moveituser.edit_moveit_user_byid}));
app.route("/admin/salesuser/edit").put(routesVersioning({"1.0.0":salesuser.edit_a_user}));
app.route("/admin/menuitems/:makeit_userid").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
app.route("/admin/product/addquantity").put(routesVersioning({"1.0.0":product.add_quantity}));
app.route("/admin/product/edit").put(routesVersioning({"1.0.0":product.update_a_product_by_makeit_userid}));
app.route("/admin/menuitem/edit").put(routesVersioning({"1.0.0":menuitem.update_a_menuitem}));
app.route("/admin/cartdetails").post(routesVersioning({"1.0.0":makeituser.admin_check_cartdetails}));
app.route("/admin/querylist").post(routesVersioning({"1.0.0":queryquestion.read_a_question_byadmin}));
app.route("/admin/queryreplies/:qid").get(routesVersioning({"1.0.0":queryanswer.read_a_replies}));
app.route("/admin/queryanswer").post(routesVersioning({"1.0.0":queryanswer.create_a_answer}));
app.route("/admin/queryread").put(routesVersioning({"1.0.0":queryquestion.update_read_query_by_admin}));
app.route("/admin/query/userlist/:type").get(routesVersioning({"1.0.0":queryquestion.get_user_list_by_type}));
app.route("/admin/orderpickupstatus").put(routesVersioning({"1.0.0":orders.order_pickup_status}));
app.route("/admin/qualitychecklist").post(routesVersioning({"1.0.0":moveituser.moveit_quality_checklist}));
app.route("/admin/addresslist").get(routesVersioning({"1.0.0":eatuseraddress.get_a_admin_address}));
app.route("/admin/faq").get(routesVersioning({"1.0.0":faq.list_all_faq})).post(routesVersioning({"1.0.0":faq.create_a_faq}));
app.route("/admin/faq/:id").get(routesVersioning({"1.0.0":faq.read_a_faq})).put(routesVersioning({"1.0.0":faq.update_a_faq})).delete(routesVersioning({"1.0.0":faq.delete_a_faq}));
app.route("/admin/faqs/:id").get(routesVersioning({"1.0.0":faq.list_all_faqbytype}));
app.route("/admin/feedback").get(routesVersioning({"1.0.0":feedback.list_all_feedback}));
app.route("/admin/productdelete").put(routesVersioning({"1.0.0":product.delete_status_product}));
app.route("/admin/product/approvestatus").put(routesVersioning({"1.0.0":product.approve_status_product}));
app.route("/admin/product/unapprove").post(routesVersioning({"1.0.0":product.admin_unapproval_approve_list}));
app.route("/admin/menuitem/unapprove").post(routesVersioning({"1.0.0":menuitem.admin_unapproval_approve_list}));
app.route("/admin/product/:id").get(routesVersioning({"1.0.0":product.read_a_product})).delete(routesVersioning({"1.0.0":product.delete_a_product}));
app.route("/admin/menuitem/:itemid").delete(routesVersioning({"1.0.0":menuitem.delete_status_menuitem}));
app.route("/admin/menuitem/approve").put(routesVersioning({"1.0.0":menuitem.approve_status_menuitem}));
app.route("/admin/makeit/documentstore").post(routesVersioning({"1.0.0":makeituser.makeit_document_store}));
app.route("/admin/makeit/approved").put(routesVersioning({"1.0.0":salesuser.admin_makeit_approved}));
app.route("/admin/refundlist").get(routesVersioning({"1.0.0":refundOnline.get_all_refund_list}));
app.route("/admin/order/cancel").put(routesVersioning({"1.0.0":orders.admin_order_cancel}));
app.route("/admin/order/refundcreate").put(routesVersioning({"1.0.0":orders.eat_order_item_missing}));
app.route("/admin/dashboard").get(routesVersioning({"1.0.0":admindashboard.get_all_dashboard_count}));
app.route("/admin/repayment").post(routesVersioning({"1.0.0":Razorpay.razorpay_refund_payment}));
app.route("/admin/sales/sendotp").post(routesVersioning({"1.0.0":salesuser.Salesuser_send_otp_byphone}));
app.route("/admin/sales/otpverification").post(routesVersioning({"1.0.0":salesuser.sales_user_otp_verification}));
app.route("/admin/moveituser/sendotp").post(routesVersioning({"1.0.0":moveituser.Moveituser_send_otp_byphone}));
app.route("/admin/moveituser/otpverification").post(routesVersioning({"1.0.0":moveituser.Moveituserotpverification}));
app.route("/admin/makeit/createimages").post(routesVersioning({"1.0.0":MakeitImages.create_a_MakeitImages}));
app.route("/admin/order/refund/list/:activestatus").get(routesVersioning({"1.0.0":refundcoupon.list_all_refund_coupon_by_activestatus}));
app.route("/admin/order/refund/create/").post(routesVersioning({"1.0.0":refundcoupon.createRefundCoupon}));
app.route("/admin/order/refund/remove/:rcid").delete(routesVersioning({"1.0.0":refundcoupon.delete_a_RefundCoupon}));
app.route("/admin/orders/waitinglist").get(routesVersioning({"1.0.0":orders.order_waiting_list_by_admin}));
app.route("/admin/badges").get(routesVersioning({"1.0.0":makeituser.admin_list_all_badges}));
app.route("/admin/moveit/todayincome").post(routesVersioning({"1.0.0":orders.moveit_delivery_cash_received_by_today}));
app.route("/admin/orders/amount").post(routesVersioning({"1.0.0":orders.getTotalAmountofOrders}));
app.route("/admin/products/salescount").post(routesVersioning({"1.0.0":orders.get_sales_products_count}));
app.route("/admin/orders/reassign").post(routesVersioning({"1.0.0":orders.reassign_orders}));
app.route("/admin/moveit/logout").post(routesVersioning({"1.0.0":moveituser.admin_force_Moveituser_logout}));
app.route("/admin/stories").get(routesVersioning({"1.0.0":Stories.list_all_Stories}));
app.route("/admin/login").post(routesVersioning({"1.0.0":adminController.login}));
app.route("/admin/logout").post(routesVersioning({"1.0.0":adminController.logout}));
app.route("/admin/pushupdate").put(routesVersioning({"1.0.0":adminController.updatePushToken}));
app.route("/admin/order/delivery").put(routesVersioning({"1.0.0":orders.admin_order_delivery}));
app.route("/admin/order/paymentstatus").put(routesVersioning({"1.0.0":orders.admin_order_payment_status}));
app.route("/admin/moveit/ordercount").post(routesVersioning({"1.0.0":orders.admin_order_order_count_by_moveit}));
app.route("/admin/makeit/unserviceable").post(routesVersioning({"1.0.0":makeituser.admin_makeit_serviceable_status}));


app.route("/admin/reports/moveitorders").post(routesVersioning({"1.0.0":orders.admin_moveit_no_orders}));
app.route("/admin/reports/orderturnaroundtime/makeit").post(routesVersioning({"1.0.0":orders.admin_order_turnaround_time_makeit}));
app.route("/admin/reports/orderturnaroundtime/moveit").post(routesVersioning({"1.0.0":orders.admin_order_turnaround_time_moveit}));
app.route("/admin/reports/ordercanceled").post(routesVersioning({"1.0.0":orders.admin_order_canceled}));
app.route("/admin/reports/ordercost").post(routesVersioning({"1.0.0":orders.admin_order_cost}));
app.route("/admin/reports/adminviadelivery").post(routesVersioning({"1.0.0":orders.admin_via_order_delivey}));
app.route("/admin/appointmentlist").post(routesVersioning({"1.0.0":allocation.list_all_allocation_by_admin}));
app.route("/admin/query/userdetail").post(routesVersioning({"1.0.0":queryquestion.get_user_by_type}));
app.route("/admin/appointments/rescheduled").post(routesVersioning({"1.0.0":makeituser.makeituser_appointments_rescheduled}));
app.route("/admin/appointments/cancel").post(routesVersioning({"1.0.0":makeituser.makeituser_appointments_cancel}));

//Praveen Reports
app.route("/admin/reports/newusersreport").post(routesVersioning({"1.0.0":orders.new_users}));
app.route("/admin/reports/newusersordersreport").post(routesVersioning({"1.0.0":orders.new_users_orders}));
app.route("/admin/reports/retainedcustomerreport").post(routesVersioning({"1.0.0":orders.retained_customer}));
app.route("/admin/reports/userorderhistoryreport").post(routesVersioning({"1.0.0":orders.user_orders_history}));
app.route("/admin/reports/salesaccountreport").post(routesVersioning({"1.0.0":orders.datewise_sales}));

app.route("/admin/reports/cancelordersreport").post(routesVersioning({"1.0.0":orders.cancel_orders}));
app.route("/admin/reports/driverwisecodreport").post(routesVersioning({"1.0.0":orders.driverwise_cod}));
app.route("/admin/reports/hubtotaldeliveryreport").post(routesVersioning({"1.0.0":orders.hub_total_delivery}));

app.route("/admin/reports/productwisereport").post(routesVersioning({"1.0.0":orders.product_wise}));
app.route("/admin/reports/productwisevirtualreport").post(routesVersioning({"1.0.0":orders.product_wise_virtual}));
app.route("/admin/reports/productwiserealreport").post(routesVersioning({"1.0.0":orders.product_wise_real}));

app.route("/admin/reports/ordersreport").post(routesVersioning({"1.0.0":orders.orders_report}));
app.route("/admin/reports/virtualordersreport").post(routesVersioning({"1.0.0":orders.virtual_orders_report}));
app.route("/admin/reports/realordersreport").post(routesVersioning({"1.0.0":orders.real_orders_report}));

app.route("/admin/ordersrating").post(routesVersioning({"1.0.0":orders.orders_rating}));

app.route("/admin/reports/kitchenwisereport").post(routesVersioning({"1.0.0":orders.kitchenwise_report}));
app.route("/admin/reports/virtualmakeitearningsreport").post(routesVersioning({"1.0.0":orders.virtual_makeit_earnings}));
app.route("/admin/reports/realmakeitearningsreport").post(routesVersioning({"1.0.0":orders.real_makeit_earnings}));
app.route("/admin/reports/virtualkitchenprepareaftercancel").post(routesVersioning({"1.0.0":orders.virtual_after_cancel}));
app.route("/admin/reports/realkitchenprepareaftercancel").post(routesVersioning({"1.0.0":orders.real_after_cancel}));
app.route("/admin/reports/virtualkitchenpreparebeforecancel").post(routesVersioning({"1.0.0":orders.virtual_before_cancel}));
app.route("/admin/reports/realkitchenpreparebeforecancel").post(routesVersioning({"1.0.0":orders.real_before_cancel}));


////Razorpay Capture
app.route("/admin/orders/razorpaycapture").post(routesVersioning({"1.0.0":Razorpay.razorpaycapture}));

app.route("/admin/order/pickupcancel").put(routesVersioning({"1.0.0":orders.admin_order_pickup_cancel}));
app.route("/admin/order/preparedcancel").put(routesVersioning({"1.0.0":orders.admin_order_prepared_cancel}));
app.route("/admin/moveit/current_location").post(routesVersioning({"1.0.0":moveituser.admin_moveit_current_location}));

}