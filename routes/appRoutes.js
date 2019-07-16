"use strict";
module.exports = function(app) {
  //forever start server.js
  var routesVersioning = require('express-routes-versioning')();
  var question = require("../controllers/sales/QuestionController");
  var queryquestion = require("../controllers/common/QueryquestionController");
  var queryanswer = require("../controllers/common/QueryanswerController");
  var region = require("../controllers/common/RegionController");
  var cusine = require("../controllers/common/CusineController");
  var master = require("../controllers/common/MastersController");
  var homedown = require("../controllers/common/HometownController");
  var makeithub = require("../controllers/common/MakeitHubController");
  // Masters
  app.route("/masters/regionlist").get(routesVersioning({"1.0.0":region.list_all_region}));
  app.route("/masters/homedownlist").get(routesVersioning({"1.0.0":homedown.list_all_homedown}));
  app.route("/masters/makeithub").get(routesVersioning({"1.0.0":makeithub.list_all_makeithubs}));
  app.route("/masters/cuisinelist").get(routesVersioning({"1.0.0":cusine.list_all_Cuisine}));
  app.route("/procedure").get(routesVersioning({"1.0.0":region.pro_call}));

  // Question
  app.route("/question").get(routesVersioning({"1.0.0":question.list_all_question})).post(routesVersioning({"1.0.0":question.create_a_question}));
  app.route("/question/:id").get(routesVersioning({"1.0.0":question.read_a_question})).put(routesVersioning({"1.0.0":question.update_a_question})).delete(routesVersioning({"1.0.0":question.delete_a_question}));
  app.route("/questionsformakeit/:id").get(routesVersioning({"1.0.0":question.read_questionsformakeit}));

  // Common
  app.route("/query").post(routesVersioning({"1.0.0":queryquestion.create_a_question}));
  app.route("/querylist").post(routesVersioning({"1.0.0":queryquestion.read_a_question}));
  app.route("/repliescount").post(routesVersioning({"1.0.0":queryanswer.read_a_answer_count}));
  app.route("/queryanswer").post(routesVersioning({"1.0.0":queryanswer.create_a_answer}));
  app.route("/queryreplies/:qid").get(routesVersioning({"1.0.0":queryanswer.read_a_replies}));
  app.route("/repliesread").put(routesVersioning({"1.0.0":queryanswer.update_read_answer}));
  app.route("/masters").get(routesVersioning({"1.0.0":master.read_a_masters}));

//  /// Eat
//   app.route("/eat/products").post(routesVersioning({"1.0.0": eatuser.eat_makeit_product_list}));
//   app.route("/eat/placeorder").post(routesVersioning({"1.0.0":orders.eatuser_order_create}));
//   app.route("/eat/order/:orderid").get(routesVersioning({"1.0.0":orders.order_view_eatuser}));
//   app.route("/eat/orders/:userid").get(routesVersioning({"1.0.0":orders.order_list_eatuser}));
//   app.route("/eat/address").get(routesVersioning({"1.0.0":eatuseraddress.list_all_address})).post(routesVersioning({"1.0.0":eatuseraddress.create_a_address}));
//   app.route("/eat/address/:userid").get(routesVersioning({"1.0.0":eatuseraddress.read_a_user_address_userid})).delete(routesVersioning({"1.0.0":eatuseraddress.delete_a_user_address}));
//   app.route("/eat/addresslist/:aid").get(routesVersioning({"1.0.0":eatuseraddress.read_a_user_address_aid}));
//   app.route("/eat/address/").put(routesVersioning({"1.0.0":eatuseraddress.update_a_user_address}));
//   app.route("/eat/addressdelete").put(routesVersioning({"1.0.0":eatuseraddress.update_delete_status}));
//   app.route("/eat/makeituser/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user}));
//   app.route("/eat/order/add").post(routesVersioning({"1.0.0":orders.eatcreateOrder}));
//   app.route("/eat/orderplace").post(routesVersioning({"1.0.0":orders.online_order_place_conformation}));
//   app.route("/eat/cartdetails").post(routesVersioning({"1.0.0":makeituser.read_a_cartdetails}));
//   app.route("/eat/dishlist").post(routesVersioning({"1.0.0":eatuser.eat_dish_sort_filter}));
//   app.route("/eat/kitchenlist").post(routesVersioning({"1.0.0":eatuser.eat_kitchen_sort_filter}));
//   app.route("/eat/fav").post(routesVersioning({"1.0.0":fav.create_a_fav}));
//   app.route("/eat/fav/:id").delete(routesVersioning({"1.0.0":fav.delete_a_fav}));
//   app.route("/eat/fav/dishlist/:id").get(routesVersioning({"1.0.0":fav.read_a_fav_dishlist}));
//   app.route("/eat/fav/kitchenlist/:id").get(routesVersioning({"1.0.0":fav.read_a_fav_kitchenlist}));
//   app.route("/eat/liveorders/:userid").get(routesVersioning({"1.0.0":orders.live_order_list_byeatuser}));
//   app.route("/eat/proceedtopay").post(routesVersioning({"1.0.0":orders.read_a_proceed_to_pay}));
//   app.route("/eat/referral/:userid").get(routesVersioning({"1.0.0":eatuser.eat_user_referral}));
//   app.route("/eat/login").post(routesVersioning({"1.0.0":eatuser.eatuser_login}));
//   app.route("/eat/otpverification").post(routesVersioning({"1.0.0":eatuser.eatuser_otpverification}));
//   app.route("/eat/edit").put(routesVersioning({"1.0.0":eatuser.edit_eat_users}));
//   app.route("/eat/feedback").get(routesVersioning({"1.0.0":feedback.list_all_feedback})).post(routesVersioning({"1.0.0":feedback.create_a_feedback}));
//   app.route("/eat/checklogin").post(routesVersioning({"1.0.0":eatuser.checklogin}));
//   app.route("/eat/postregistration").put(routesVersioning({"1.0.0":eatuser.eat_user_post_registration}));
//   app.route("/eat/forgot").post(routesVersioning({"1.0.0":eatuser.eat_user_forgot_password}));
//   app.route("/eat/password").put(routesVersioning({"1.0.0":eatuser.eat_user_forgot_password_update}));
//   app.route("/eat/rating").post(routesVersioning({"1.0.0":orderrating.createorderrating}));
//   app.route("/eat/pushid/add").put(routesVersioning({"1.0.0":eatuser.add_a_pushid}));
//   app.route("/eat/defaultaddress").put(routesVersioning({"1.0.0":eatuseraddress.eat_user_default_address_update}));
//   app.route("/eat/payment/customerid").get(routesVersioning({"1.0.0":eatuser.create_customerid_by_razorpay}));
//   app.route("/eat/region/kitchenlist").post(routesVersioning({"1.0.0":eatuser.eat_region_list_sort_filter}));
//   app.route("/eat/regionlist").post(routesVersioning({"2.0.0": eatuser.eat_region_list2,"1.0.0": eatuser.eat_region_list}));
//   app.route("/eat/kitche/showmore").post(routesVersioning({"1.0.0":eatuser.eat_region_kitchen_showmore}));
//   app.route("/eat/product/search").post(routesVersioning({"1.0.0":eatuser.eat_explore_dish}));
//   app.route("/eat/explore").get(routesVersioning({"1.0.0":quicksearch.eat_explore_store_data}));
//   app.route("/eat/quicksearch").post(routesVersioning({"1.0.0":quicksearch.eat_explore_quick_search}));
//   app.route("/eat/order/cancel").put(routesVersioning({"1.0.0":orders.eat_order_cancel}));
//   app.route("/eat/refund/:userid").get(routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));
//   app.route("/eat/refundupdate").put(routesVersioning({"1.0.0":refundcoupon.updateByRefundCouponId}));
//   app.route("/eat/stories").get(routesVersioning({"1.0.0":Stories.list_all_Stories}));
//   app.route("/eat/order/refund/getlastcoupon/:userid").get(routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));

//  // Makeit
//   app.route("/makeit/orders").get(routesVersioning({"1.0.0":makeituser.all_order_list}));
//   app.route("/makeit/orders/listbydate").post(routesVersioning({"1.0.0":makeituser.all_order_list_bydate}));
//   app.route("/makeit/orders/:id").get(routesVersioning({"1.0.0":makeituser.orderlist}));
//   app.route("/makeit/ordershistory/:id").get(routesVersioning({"1.0.0":makeituser.orderhistory}));
//   app.route("/makeit/orderview/:orderid").get(routesVersioning({"1.0.0":makeituser.orderview}));
//   app.route("/makeit/orderstatus").put(routesVersioning({"1.0.0":makeituser.orderstatus}));
//   app.route("/makeit/lproduct/:makeit_userid").get(routesVersioning({"1.0.0":product.list_all_liveproduct}));
//   app.route("/makeit/moveliveproduct").post(routesVersioning({"1.0.0":product.moveliveproduct}));
//   app.route("/makeit/productitem/:productid").get(routesVersioning({"1.0.0":product.productitemlist}));
//   app.route("/makeit/addquantity").put(routesVersioning({"1.0.0":product.add_quantity}));
//   app.route("/makeit/addquantityandproductlive").put(routesVersioning({"1.0.0":product.add_quantity_productlive}));
//   app.route("/makeit/menuitems/:makeit_userid").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
//   app.route("/makeit/edit").put(routesVersioning({"1.0.0":makeituser.edit_makeit_user_byid}));
//   app.route("/makeit/referral/:userid").get(routesVersioning({"1.0.0":makeituser.make_user_referral}));
//   app.route("/makeit/phoneotp").post(routesVersioning({"1.0.0":makeituser.makeit_user_send_otp}));
//   app.route("/makeit/otpverification").post(routesVersioning({"1.0.0":makeituser.makeit_otp_verification}));
//   app.route("/makeit/password").put(routesVersioning({"1.0.0":makeituser.makeit_user_forgot_password_update}));
//   app.route("/makeit/forgot").post(routesVersioning({"1.0.0":makeituser.makeit_user_forgot_send_otp_by_phone}));
//   app.route("/makeit/productupload").post(routesVersioning({"1.0.0":documents.makeit_product_upload_a_document}));
//   app.route("/makeit/documentupload").post(routesVersioning({"1.0.0":documents.makeit_upload_a_documents}));
//   app.route("/makeit/product/edit").put(routesVersioning({"1.0.0":product.edit_product_by_makeit_userid}));
//   app.route("/makeit/product/:id").get(routesVersioning({"1.0.0":product.read_a_product})).put(routesVersioning({"1.0.0":product.update_a_product})).delete(routesVersioning({"1.0.0":product.delete_a_product}));
//   app.route("/makeit/productlist/:makeit_userid").get(routesVersioning({"1.0.0":product.list_all_product_makeit_userid}));
//   app.route("/makeit/menuitem/unapprove").post(routesVersioning({"1.0.0":menuitem.admin_unapproval_approve_list}));
//   app.route("/makeit/menuitem/edit").put(routesVersioning({"1.0.0":menuitem.update_a_menuitem}));
//   app.route("/makeit/menuitem/:itemid").delete(routesVersioning({"1.0.0":menuitem.delete_status_menuitem}));
//   app.route("/makeit/earnings/:makeit_userid").get(routesVersioning({"1.0.0":makeituser.makeit_earnings}));
//   app.route("/makeit/pushid/add").put(routesVersioning({"1.0.0":makeituser.add_a_pushid}));
//   app.route("/makeit/dayearnings/:makeit_userid").get(routesVersioning({"1.0.0":makeituser.makeit_earnings_day}));
//   app.route("/makeit/menuitems/:makeit_userid").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
//   app.route("/makeit/menuitemlist/:makeit_userid") .get(routesVersioning({"1.0.0":menuitem.list_all_menuitem_by_makeituserid}));
//   app.route("/makeit/appoinmentinfo/:makeit_userid").get(routesVersioning({"1.0.0":makeituser.appointment_info}));
//   app.route("/makeit/order/cancel").put(routesVersioning({"1.0.0":orders.makeit_order_cancel}));
//   app.route("/makeit/order/accept").put(routesVersioning({"1.0.0":orders.makeit_order_accept}));
//   app.route("/makeit/order/missing").put(routesVersioning({"1.0.0":orders.makeit_order_missing}));
//   app.route("/makeit/users").get(routesVersioning({"1.0.0":makeituser.list_all_user})).post(routesVersioning({"1.0.0":makeituser.create_a_user}));
//   app.route("/makeit/user/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user})).put(routesVersioning({"1.0.0":makeituser.update_a_user})).delete(routesVersioning({"1.0.0":makeituser.delete_a_user}));
//   app.route("/makeit/login").post(routesVersioning({"1.0.0":makeituser.checklogin}));
//   app.route("/makeit/registration").post(routesVersioning({"1.0.0":makeituser.create_a_user}));
//   app.route("/makeit/paymentregistration/:userid").put(routesVersioning({"1.0.0":makeituser.update_payment_registration}));
//   app.route("/makeit/bookappointment").put(routesVersioning({"1.0.0":makeituser.creat_a_appointment}));
//   app.route("/makeit/appointments").get(routesVersioning({"1.0.0":makeituser.list_all_appointment}));
//   app.route("/makeit/menuitem").get(routesVersioning({"1.0.0":menuitem.list_all_menuitem})).post(routesVersioning({"1.0.0":menuitem.create_a_menuitem}));
//   app.route("/makeit/product").get(routesVersioning({"1.0.0":product.list_all_product})).post(routesVersioning({"1.0.0":product.create_a_product}));


//   //Sales API
//   app.route("/sales/makeit/followupstatus").put(routesVersioning({"1.0.0":allocation.update_a_followupstatus}));
//   app.route("/sales/faq").get(routesVersioning({"1.0.0":faq.list_all_faq}));
//   app.route("/sales/makeit/documentupload").post(routesVersioning({"1.0.0":documents.upload_a_documents}));
//   app.route("/sales/documentView").post(routesVersioning({"1.0.0":salesdocument.sales_document_view}));
//   app.route("/sales/document/remove").delete(routesVersioning({"1.0.0":documents.remove_s3_sales_doc}));
//   app.route("/sales/pushid/add").put(routesVersioning({"1.0.0":salesuser.add_a_pushid}));
//   app.route("/sales/makeitinfo/update").put(routesVersioning({"1.0.0":makeituser.edit_makeit_brand_identity}));
//   app.route("/sales/makeitdocument/update").post(routesVersioning({"1.0.0":salesdocument.create_a_new_infodocument}));
//   app.route("/sales/makeitkitchen/update").post(routesVersioning({"1.0.0":salesdocument.create_a_new_documents}));
//   app.route("/sales/rating").post(routesVersioning({"1.0.0":salesuser.create_a_rating}));
//   app.route("/sales/makeit/approved").put(routesVersioning({"1.0.0":salesuser.makeit_approved}));
//   app.route("/sales/makeitinfo/:makeit_userid").get(routesVersioning({"1.0.0":salesuser.get_makeit_kitchen_info}));
//   app.route("/sales/makeitdocument/:makeit_userid").get(routesVersioning({"1.0.0":salesuser.get_makeit_user_document}));
//   app.route("/sales/makeitkitchens/:makeit_userid").get(routesVersioning({"1.0.0":salesuser.get_makeit_kitchen_document}));
//   app.route("/sales/rating/:makeit_userid").get(routesVersioning({"1.0.0":salesuser.get_sales_makeit_rating}));
//   app.route("/sales/history/:userid").get(routesVersioning({"1.0.0":allocation.list_all_history_by_salesempid}));
//   app.route("/sales/login").post(routesVersioning({"1.0.0":salesuser.checklogin}));
//   app.route("/sales/registration").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
//   app.route("/sales/trainingdocs").get(routesVersioning({"1.0.0":documents.list_all_sales_training_documents}));
//   app.route("/sales/tasklist/:id").get(routesVersioning({"1.0.0":allocation.list_all_allocation_by_salesempid}));

//   //Moveit
//   app.route("/moveit/faqs/:id").get(routesVersioning({"1.0.0":faq.list_all_faqbytype}));
//   app.route("/moveit/onlinestatus").put(routesVersioning({"1.0.0":moveituser.moveit_live_status}));
//   app.route("/moveit/orders/:moveit_user_id").get(routesVersioning({"1.0.0":orders.orderlist_by_moveit_userid}));
//   app.route("/moveit/vorders/:orderid").get(routesVersioning({"1.0.0":orders.orderview}));
//   app.route("/moveit/orderpickupstatus").put(routesVersioning({"1.0.0":orders.order_pickup_status}));
//   app.route("/moveit/orderdeliverystatus").put(routesVersioning({"1.0.0":orders.order_delivery_status}));
//   app.route("/moveit/moveitstatus").put(routesVersioning({"1.0.0":orders.moveit_kitchen_reached}));
//   app.route("/moveit/makeitrating").put(routesVersioning({"1.0.0":moveituser.moveit_kitchen_rating}));
//   app.route("/moveit/qualitycheck").post(routesVersioning({"1.0.0":moveituser.moveit_kitchen_qualitycheck}));
//   app.route("/moveit/paymentstatus").put(routesVersioning({"1.0.0":orders.order_payment_status}));
//   app.route("/moveit/ordershistory/:moveit_user_id").get(routesVersioning({"1.0.0":orders.orderhistory_by_moveit_userid}));
//   app.route("/moveit/documentUpload").post(routesVersioning({"1.0.0":documents.moveit_upload_a_documents}));
//   app.route("/moveit/documentstore").post(routesVersioning({"1.0.0":moveitdocument.create_a_documents}));
//   app.route("/moveit/makeitrating").put(routesVersioning({"1.0.0":moveituser.moveit_kitchen_rating}));
//   app.route("/moveit/qualitychecklist").post(routesVersioning({"1.0.0":moveituser.moveit_quality_checklist}));
//   app.route("/moveit/pushid/add").put(routesVersioning({"1.0.0":moveituser.add_a_pushid}));
//   app.route("/moveit/registration").post(routesVersioning({"1.0.0":moveituser.create_a_user}));
//   app.route("/moveit/login").post(routesVersioning({"1.0.0":moveituser.checklogin}));
//   app.route("/moveit/hub").post(routesVersioning({"1.0.0":moveituser.read_a_hub_details}));
//   app.route("/moveit/setlocation").post(routesVersioning({"1.0.0":moveituser.setGeoLocation}));
//   app.route("/moveit/getlocation").post(routesVersioning({"1.0.0":moveituser.getGeoLocation}));
//   app.route("/moveitusers").get(routesVersioning({"1.0.0":moveituser.list_all_user})).post(routesVersioning({"1.0.0":moveituser.create_a_user}));
//   app.route("/moveitusers/:userid").get(routesVersioning({"1.0.0":moveituser.read_a_user})).put(routesVersioning({"1.0.0":moveituser.update_a_user})).delete(routesVersioning({"1.0.0":moveituser.delete_a_user}));

//   /*Admin Api*/
//   app.route("/admin/eatuser/add").post(routesVersioning({"1.0.0":eatuser.create_a_eatuser}));
//   app.route("/admin/eatusers/").post(routesVersioning({"1.0.0":eatuser.list_all_virtual_eatuser}));
//   app.route("/admin/order/add").post(routesVersioning({"1.0.0":orders.eatuser_order_create}));
//   app.route("/admin/orders").post(routesVersioning({"1.0.0":orders.list_all_orders}));
//   app.route("/admin/vorders").post(routesVersioning({"1.0.0":orders.list_today_virtual_makeit_orders}));
//   app.route("/admin/vorders/history").post(routesVersioning({"1.0.0":orders.list_all_virtual_makeit_orders}));
//   app.route("/admin/order/:id").get(routesVersioning({"1.0.0":orders.order_view}));
//   app.route("/admin/orderstatus/update").put(routesVersioning({"1.0.0":orders.order_status_update}));
//   app.route("/admin/order/assign").put(routesVersioning({"1.0.0":orders.order_assign}));
//   app.route("/admin/orders/unassign").get(routesVersioning({"1.0.0":orders.un_assign_orders}));
//   app.route("/admin/product").post(routesVersioning({"1.0.0":product.admin_list_all_product}));
//   app.route("/admin/makeitusers").post(routesVersioning({"1.0.0":makeituser.admin_list_all_makeitusers}));
//   app.route("/admin/unapproved/makeitlist").post(routesVersioning({"1.0.0":makeituser.admin_makeit_unapproved_list}));
//   app.route("/admin/makeituser/add").post(routesVersioning({"1.0.0":makeituser.create_a_user}));
//   app.route("/admin/salesuser/add").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
//   app.route("/admin/moveituser/add").post(routesVersioning({"1.0.0":moveituser.create_a_user}));
//   app.route("/admin/appointments").get(routesVersioning({"1.0.0":makeituser.list_all_appointment}));
//   app.route("/admin/appointment/assign").post(routesVersioning({"1.0.0":allocation.create_a_allocation}));
//   app.route("/admin/moveit/nearbyuser").post(routesVersioning({"1.0.0":moveituser.getNearByMoveit}));
//   app.route("/admin/eatuser/:userid").get(routesVersioning({"1.0.0":eatuser.read_a_user})).put(routesVersioning({"1.0.0":eatuser.update_a_user})).delete(routesVersioning({"1.0.0":eatuser.delete_a_user}));
//   app.route("/admin/makeituser/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user})).delete(routesVersioning({"1.0.0":makeituser.delete_a_user}));
//   app.route("/admin/salesusers").post(routesVersioning({"1.0.0":salesuser.salesSearch}));
//   app.route("/admin/moveitusers").post(routesVersioning({"1.0.0":moveituser.moveitSearch}));
//   app.route("/admin/salesuser/:userid").get(routesVersioning({"1.0.0":salesuser.read_a_user})).delete(routesVersioning({"1.0.0":salesuser.delete_a_user}));
//   app.route("/admin/moveituser/:userid").get(routesVersioning({"1.0.0":moveituser.admin_read_a_user})).delete(routesVersioning({"1.0.0":moveituser.delete_a_user}));
//   app.route("/admin/sales/documentupload").post(routesVersioning({"1.0.0":documents.sales_upload_a_documents}));
//   app.route("/admin/moveit/documentupload").post(routesVersioning({"1.0.0":documents.moveit_upload_a_documents}));
//   app.route("/admin/makeit/documentupload").post(routesVersioning({"1.0.0":documents.makeit_upload_a_documents}));
//   app.route("/admin/moveit/documentstore").post(routesVersioning({"1.0.0":moveitdocument.create_a_documents}));
//   app.route("/admin/menuitem/add").post(routesVersioning({"1.0.0":menuitem.create_a_menuitem}));
//   app.route("/admin/menuitem/view/:id").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem}));
//   app.route("/admin/product/add").post(routesVersioning({"1.0.0":product.create_a_product}));
//   app.route("/admin/liveproduct/:makeit_userid").get(routesVersioning({"1.0.0":product.list_all_liveproduct}));
//   app.route("/admin/product/view/:productid").get(routesVersioning({"1.0.0":product.productview}));
//   app.route("/admin/product/movetolive").post(routesVersioning({"1.0.0":product.add_quantity_productlive}));
//   app.route("/admin/makeituser/edit").put(routesVersioning({"1.0.0":makeituser.edit_makeit_user_byid}));
//   app.route("/admin/moveituser/edit").put(routesVersioning({"1.0.0":moveituser.edit_moveit_user_byid}));
//   app.route("/admin/salesuser/edit").put(routesVersioning({"1.0.0":salesuser.edit_a_user}));
//   app.route("/admin/menuitems/:makeit_userid").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
//   app.route("/admin/product/addquantity").put(routesVersioning({"1.0.0":product.add_quantity}));
//   app.route("/admin/product/edit").put(routesVersioning({"1.0.0":product.update_a_product_by_makeit_userid}));
//   app.route("/admin/menuitem/edit").put(routesVersioning({"1.0.0":menuitem.update_a_menuitem}));
//   app.route("/admin/cartdetails").post(routesVersioning({"1.0.0":makeituser.admin_check_cartdetails}));
//   app.route("/admin/querylist").post(routesVersioning({"1.0.0":queryquestion.read_a_question_byadmin}));
//   app.route("/admin/queryreplies/:qid").get(routesVersioning({"1.0.0":queryanswer.read_a_replies}));
//   app.route("/admin/queryanswer").post(routesVersioning({"1.0.0":queryanswer.create_a_answer}));
//   app.route("/admin/queryread").put(routesVersioning({"1.0.0":queryquestion.update_read_query_by_admin}));
//   app.route("/admin/query/userlist/:type").get(routesVersioning({"1.0.0":queryquestion.get_user_list_by_type}));
//   app.route("/admin/orderpickupstatus").put(routesVersioning({"1.0.0":orders.order_pickup_status}));
//   app.route("/admin/qualitychecklist").post(routesVersioning({"1.0.0":moveituser.moveit_quality_checklist}));
//   app.route("/admin/addresslist").get(routesVersioning({"1.0.0":eatuseraddress.get_a_admin_address}));
//   app.route("/admin/faq").get(routesVersioning({"1.0.0":faq.list_all_faq})).post(routesVersioning({"1.0.0":faq.create_a_faqt}));
//   app.route("/admin/faq/:id").get(routesVersioning({"1.0.0":faq.read_a_faq})).put(routesVersioning({"1.0.0":faq.update_a_faqt})).delete(routesVersioning({"1.0.0":faq.delete_a_faq}));
//   app.route("/admin/faqs/:id").get(routesVersioning({"1.0.0":faq.list_all_faqbytype}));
//   app.route("/admin/feedback").get(routesVersioning({"1.0.0":feedback.list_all_feedback}));
//   app.route("/admin/productdelete").put(routesVersioning({"1.0.0":product.delete_status_product}));
//   app.route("/admin/product/approvestatus").put(routesVersioning({"1.0.0":product.approve_status_product}));
//   app.route("/admin/product/unapprove").post(routesVersioning({"1.0.0":product.admin_unapproval_approve_list}));
//   app.route("/admin/menuitem/unapprove").post(routesVersioning({"1.0.0":menuitem.admin_unapproval_approve_list}));
//   app.route("/admin/product/:id").get(routesVersioning({"1.0.0":product.read_a_productt})).delete(routesVersioning({"1.0.0":product.delete_a_product}));
//   app.route("/admin/menuitem/:itemid").delete(routesVersioning({"1.0.0":menuitem.delete_status_menuitem}));
//   app.route("/admin/menuitem/approve").put(routesVersioning({"1.0.0":menuitem.approve_status_menuitem}));
//   app.route("/admin/makeit/documentstore").post(routesVersioning({"1.0.0":makeituser.makeit_document_store}));
//   app.route("/admin/makeit/approved").put(routesVersioning({"1.0.0":salesuser.admin_makeit_approved}));
//   app.route("/admin/refundlist").get(routesVersioning({"1.0.0":refundOnline.get_all_refund_list}));
//   app.route("/admin/order/cancel").put(routesVersioning({"1.0.0":orders.admin_order_cancel}));
//   app.route("/admin/order/refundcreate").put(routesVersioning({"1.0.0":orders.eat_order_missing}));
//   app.route("/admin/dashboard").get(routesVersioning({"1.0.0":admindashboard.get_all_dashboard_count}));
//   app.route("/admin/repayment").post(routesVersioning({"1.0.0":Razorpay.razorpay_refund_payment}));
//   app.route("/admin/sales/sendotp").post(routesVersioning({"1.0.0":salesuser.Salesuser_send_otp_byphone}));
//   app.route("/admin/sales/otpverification").post(routesVersioning({"1.0.0":salesuser.sales_user_otp_verification}));
//   app.route("/admin/moveituser/sendotp").post(routesVersioning({"1.0.0":moveituser.Moveituser_send_otp_byphone}));
//   app.route("/admin/moveituser/otpverification").post(routesVersioning({"1.0.0":moveituser.Moveituserotpverification}));
//   app.route("/admin/makeit/createimages").post(routesVersioning({"1.0.0":MakeitImages.create_a_MakeitImages}));
//   app.route("/admin/order/refund/list/:activestatus").get(routesVersioning({"1.0.0":refundcoupon.list_all_refund_coupon_by_activestatus}));
//   app.route("/admin/order/refund/create/").post(routesVersioning({"1.0.0":refundcoupon.createRefundCoupon}));
//   app.route("/admin/order/refund/remove/:rcid").delete(routesVersioning({"1.0.0":refundcoupon.delete_a_RefundCoupon}));
  
  

};
