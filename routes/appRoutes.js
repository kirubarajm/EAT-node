"use strict";
module.exports = function(app) {
  //forever start server.js

  var todoList = require("../controllers/AppController");
  var eatuser = require("../controllers/eat/EatUserController");
  var moveituser = require("../controllers/moveit/MoveitUserController");
  var makeituser = require("../controllers/makeit/MakeitUserController");
  var salesuser = require("../controllers/sales/SalesUserController");
  var localities = require("../controllers/common/LocalitiesController");
  var documents = require("../controllers/common/DocumentsController");
  var menuitem = require("../controllers/makeit/MenuItemController");
  var product = require("../controllers/makeit/ProductController");
  var question = require("../controllers/sales/QuestionController");
  var fav = require("../controllers/eat/FavController");
  var faq = require("../controllers/common/FaqController");
  var allocation = require("../controllers/sales/AllocationController");
  var orders = require("../controllers/common/OrderController");
  var salesdocument = require("../controllers/common/DocumentsalesController");
  var moveitdocument = require("../controllers/common/DocumentmoveitController");
  var eatuseraddress = require("../controllers/eat/EatUserAddressController");
  var ordersitem = require("../controllers/common/OrderitemController");
  var queryquestion = require("../controllers/common/QueryquestionController");
  var queryanswer = require("../controllers/common/QueryanswerController");
  var region = require("../controllers/common/RegionController");
  var cusine = require("../controllers/common/CusineController");
  var master = require("../controllers/common/MastersController");
  var feedback = require("../controllers/common/EatfeedbackController");
  var orderrating = require("../controllers/common/OrderratingController");
  var homedown = require("../controllers/common/HometownController");
  var makeithub = require("../controllers/common/MakeitHubController");

  // todoList Routes
  app
    .route("/tasks")
    .get(todoList.list_all_tasks)
    .post(todoList.create_a_task);

  app
    .route("/tasks/:taskId")
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);

  //Routes for eat users

  app
    .route("/eatusers")
    .get(eatuser.list_all_eatuser)
    .post(eatuser.create_a_eatuser);

  app
    .route("/eatusers/:userid")
    .get(eatuser.read_a_user)
    .put(eatuser.update_a_user);
  //.delete(eatuser.delete_a_user);

  //Routes for moveit users

  app
    .route("/moveitusers")
    .get(moveituser.list_all_user)
    .post(moveituser.create_a_user);

  app
    .route("/moveitusers/:userid")
    .get(moveituser.read_a_user)
    .put(moveituser.update_a_user)
    .delete(moveituser.delete_a_user);

  app.route("/moveit/registration").post(moveituser.create_a_user);

  app.route("/moveit/login").post(moveituser.checklogin);

  app.route("/moveit/hub").post(moveituser.read_a_hub_details);

  //Routes for makeit users

  app
    .route("/makeitusers")
    .get(makeituser.list_all_user)
    .post(makeituser.create_a_user);

  app
    .route("/makeitusers/:userid")
    .get(makeituser.read_a_user)
    .put(makeituser.update_a_user)
    .delete(makeituser.delete_a_user);

  app.route("/makeit/login").post(makeituser.checklogin);

  app.route("/makeit/registration").post(makeituser.create_a_user);

  app
    .route("/makeit/paymentregistration/:userid")
    .put(makeituser.update_payment_registration);

  // app.route('/makeit/bookappointment/:userid')
  //   .put(makeituser.creat_a_appointment)

  app.route("/makeit/bookappointment").put(makeituser.creat_a_appointment);

  app.route("/makeit/appointments/").get(makeituser.list_all_appointment);

  //Routes for Sales users

  app
    .route("/salesusers")
    .get(salesuser.list_all_user)
    .post(salesuser.create_a_user);

  app
    .route("/salesusers/:userid")
    .get(salesuser.read_a_user)
    .put(salesuser.update_a_user)
    .delete(salesuser.delete_a_user);

  app.route("/sales/login").post(salesuser.checklogin);

  app.route("/sales/registration").post(salesuser.create_a_user);

  //Routes for Common Api's

  app
    .route("/localities")
    .get(localities.list_all_locality)
    .post(localities.create_a_locality);

  app
    .route("/localities/:id")
    .get(localities.read_a_locality)
    .put(localities.update_a_locality)
    .delete(localities.delete_a_locality);

  //Documents

  app
    .route("/documents")
    .get(documents.list_all_documents)
    .post(documents.create_a_documents);

  app
    .route("/documents/:id")
    .get(documents.read_a_documents)
    .put(documents.update_a_documents)
    .delete(documents.delete_a_documents);

  app
    .route("/sales/trainingdocs")
    .get(documents.list_all_sales_training_documents);
  //.post(documents.create_a_sales_training_documents);

  app
    .route("/menuitem")
    .get(menuitem.list_all_menuitem)
    .post(menuitem.create_a_menuitem);

  app
    .route("/menuitem/:id")
    .get(menuitem.read_a_menuitem)
    .put(menuitem.update_a_menuitem)
    .delete(menuitem.delete_a_menuitem);

  app
    .route("/product")
    .get(product.list_all_product)
    .post(product.create_a_product);

  app.route("/vproduct").get(product.list_all_virtual_product);

  app
    .route("/product/:id")
    .get(product.read_a_product)
    .put(product.update_a_product)
    .delete(product.delete_a_product);

  app
    .route("/question")
    .get(question.list_all_question)
    .post(question.create_a_question);

  app
    .route("/question/:id")
    .get(question.read_a_question)
    .put(question.update_a_question)
    .delete(question.delete_a_question);

  app.route("/questionsformakeit/:id").get(question.read_questionsformakeit);

  app
    .route("/fav")
    .get(fav.list_all_fav)
    .post(fav.create_a_fav);

  app
    .route("/fav/:id")
    .get(fav.read_a_fav)
    .put(fav.update_a_fav)
    .delete(fav.delete_a_fav);

  app.route("/favforeatusers/:id").get(fav.list_all_fav_eatusers);

  app
    .route("/allocation")
    .get(allocation.list_all_allocation)
    .post(allocation.create_a_allocation);

  app
    .route("/allocation/:id")
    .get(allocation.read_a_allocation)
    .put(allocation.update_a_allocation)
    .delete(allocation.delete_a_allocation);

  app
    .route("/allocation/salesempid/:id")
    .get(allocation.list_all_allocation_by_salesempid);

  app
    .route("/sales/tasklist/:id")
    .get(allocation.list_all_allocation_by_salesempid);

  app.route("/faqs/:id").get(faq.list_all_faqbytype);

  app
    .route("/faq/")
    .get(faq.list_all_faq)
    .post(faq.create_a_faq);

  app
    .route("/faq/:id")
    .get(faq.read_a_faq)
    .put(faq.update_a_faq)
    .delete(faq.delete_a_faq);

  /*app.route('/order')
     .get(order.list_all_order)
     .post(order.create_a_order);
 
    app.route('/order/:id')
     .get(order.read_a_order)
     .put(order.update_a_order)
     .delete(order.delete_a_order);*/

  // app.route('/createorder')
  // .post(makeituser.createorder);

  // Makeit

  app.route("/makeit/orders").get(makeituser.all_order_list);

  app.route("/makeit/orders/listbydate").post(makeituser.all_order_list_bydate);

  app.route("/makeit/orders/:id").get(makeituser.orderlist);

  app.route("/vorders/:orderid").get(makeituser.orderview);

  app.route("/orders").put(makeituser.orderstatus);

  app.route("/lproduct/:makeit_userid").get(product.list_all_liveproduct);

  app.route("/product/moveliveproduct/").post(product.moveliveproduct);

  app.route("/product/productitem/:productid").get(product.productitemlist);

  app.route("/virtual/eatusers").get(eatuser.list_all_virtual_eatuser);

  app.route("/virtual/:search").get(eatuser.virtual_eatusersearch);

  app.route("/makeit/addquantity").put(product.add_quantity);

  app
    .route("/makeit/addquantityandproductlive")
    .put(product.add_quantity_productlive);

  app
    .route("/makeit/menuitems/:makeit_userid")
    .get(menuitem.read_a_menuitem_byid);

  app.route("/makeit/edit").put(makeituser.edit_makeit_user_byid);

  app.route("/makeit/referral/:userid").get(makeituser.make_user_referral);

  app.route("/makeit/phoneotp").post(makeituser.makeit_user_send_otp);

  app.route("/makeit/otpverification").post(makeituser.makeit_otp_verification);

  app
    .route("/makeit/password")
    .put(makeituser.makeit_user_forgot_password_update);

  app
    .route("/makeit/forgot")
    .post(makeituser.makeit_user_forgot_send_otp_by_phone);

  app
    .route("/makeit/productupload")
    .post(documents.makeit_product_upload_a_document);

  app.route("/makeit/documentupload").post(documents.makeit_upload_a_documents);

  app.route("/makeit/product/edit").put(product.edit_product_by_makeit_userid);

  app
    .route("/makeit/product/:id")
    .get(product.read_a_product)
    .put(product.update_a_product)
    .delete(product.delete_a_product);

  app
    .route("/makeit/productlist/:makeit_userid")
    .get(product.list_all_product_makeit_userid);

  app
    .route("/makeit/menuitem/unapprove")
    .post(menuitem.admin_unapproval_approve_list);

  app.route("/makeit/menuitem/edit").put(menuitem.update_a_menuitem);

  app.route("/makeit/menuitem/:itemid").delete(menuitem.delete_status_menuitem);

  //app.route("/makeit/menuitem/:itemid").delete(menuitem.delete_status_menuitem);

  app.route("/makeit/earnings/:makeit_userid").get(makeituser.makeit_earnings);

  app
    .route("/makeit/dayearnings/:makeit_userid")
    .get(makeituser.makeit_earnings_day);


    app
    .route("/makeit/menuitems/:makeit_userid")
    .get(menuitem.read_a_menuitem_byid);

  /*Admin Api*/
  app.route("/admin/eatuser/add").post(eatuser.create_a_eatuser);

  app.route("/admin/eatusers/").post(eatuser.list_all_virtual_eatuser);

  app.route("/admin/order/add").post(orders.eatuser_order_create);

  app.route("/admin/orders").post(orders.list_all_orders);

  app.route("/admin/vorders").post(orders.list_all_virtual_makeit_orders);

  app.route("/admin/order/:id").get(orders.order_view);
  app.route("/admin/orderstatus/update").put(orders.order_status_update);

  app.route("/admin/order/assign").put(orders.order_assign);

  app.route("/admin/orders/unassign").get(orders.un_assign_orders);

  app.route("/admin/product").post(product.admin_list_all_product);

  app.route("/admin/makeitusers").post(makeituser.admin_list_all_makeitusers);

  app
    .route("/admin/makeituser/approval")
    .put(makeituser.admin_makeit_user_approval);

  app.route("/admin/makeituser/add").post(makeituser.create_a_user);

  app.route("/admin/salesuser/add").post(salesuser.create_a_user);

  app.route("/admin/moveituser/add").post(moveituser.create_a_user);

  app.route("/admin/appointments").get(makeituser.list_all_appointment);

  app.route("/admin/appointment/assign").post(allocation.create_a_allocation);

  app
    .route("/admin/eatuser/:userid")
    .get(eatuser.read_a_user)
    .put(eatuser.update_a_user)
    .delete(eatuser.delete_a_user);

  app
    .route("/admin/makeituser/:userid")
    .get(makeituser.read_a_user)
    // .put(makeituser.update_a_user)
    .delete(makeituser.delete_a_user);

  app.route("/admin/salesusers").post(salesuser.salesSearch);

  app.route("/admin/moveitusers").post(moveituser.moveitSearch);

  app
    .route("/admin/salesuser/:userid")
    .get(salesuser.read_a_user)
    //.put(salesuser.update_a_user)
    .delete(salesuser.delete_a_user);

  app
    .route("/admin/moveituser/:userid")
    .get(moveituser.admin_read_a_user)
    // .put(moveituser.update_a_user)
    .delete(moveituser.delete_a_user);

  // app.route('/admin/moveit/documentUpload')
  //   .post(documents.upload_a_documents);

  app
    .route("/admin/sales/documentupload")
    .post(documents.sales_upload_a_documents);

  app
    .route("/admin/moveit/documentupload")
    .post(documents.moveit_upload_a_documents);

  app
    .route("/admin/makeit/documentupload")
    .post(documents.makeit_upload_a_documents);

  app
    .route("/admin/moveit/documentstore")
    .post(moveitdocument.create_a_documents);

  app.route("/admin/menuitem/add").post(menuitem.create_a_menuitem);

  app.route("/admin/menuitem/view/:id").get(menuitem.read_a_menuitem);

  app.route("/admin/product/add").post(product.create_a_product);

  app
    .route("/admin/liveproduct/:makeit_userid")
    .get(product.list_all_liveproduct);

  app.route("/admin/product/view/:productid").get(product.productview);

  // app.route('/admin/product/movetolive')
  //   .post(product.moveliveproduct);

  app.route("/admin/product/movetolive").post(product.add_quantity_productlive);

  app.route("/admin/makeituser/edit").put(makeituser.edit_makeit_user_byid);

  app.route("/admin/moveituser/edit").put(moveituser.edit_moveit_user_byid);

  app.route("/admin/salesuser/edit").put(salesuser.edit_a_user);

  app
    .route("/admin/menuitems/:makeit_userid")
    .get(menuitem.read_a_menuitem_byid);

  app.route("/admin/product/addquantity").put(product.add_quantity);

  app
    .route("/admin/product/edit")
    .put(product.update_a_product_by_makeit_userid);

  app.route("/admin/menuitem/edit").put(menuitem.update_a_menuitem);

  app.route("/admin/cartdetails").post(makeituser.read_a_cartdetails);

  app.route("/admin/querylist").post(queryquestion.read_a_question);

  app.route("/admin/queryreplies/:aid").get(queryanswer.read_a_replies);

  app.route("/admin/queryanswer").post(queryanswer.create_a_answer);

  app.route("/admin/orderpickupstatus").put(orders.order_pickup_status);

  app
    .route("/admin/qualitychecklist")
    .post(moveituser.moveit_quality_checklist);

  app.route("/admin/addresslist").get(eatuseraddress.get_a_admin_address);

  app
    .route("/admin/faq")
    .get(faq.list_all_faq)
    .post(faq.create_a_faq);

  app
    .route("/admin/faq/:id")
    .get(faq.read_a_faq)
    .put(faq.update_a_faq)
    .delete(faq.delete_a_faq);

  app.route("/admin/faqs/:id").get(faq.list_all_faqbytype);

  app.route("/admin/feedback").get(feedback.list_all_feedback);

  app.route("/admin/productdelete").put(product.delete_status_product);


  app.route("/admin/product/approvestatus").put(product.approve_status_product);

  app
    .route("/admin/product/unapprove")
    .post(product.admin_unapproval_approve_list);

  app
    .route("/admin/menuitem/unapprove")
    .post(menuitem.admin_unapproval_approve_list);

    app
    .route("/admin/product/:id")
    .get(product.read_a_product)
    //.put(product.update_a_product)
    .delete(product.delete_a_product);

  app.route("/admin/menuitem/:itemid").delete(menuitem.delete_status_menuitem);

  app.route("/admin/menuitem/approve").put(menuitem.approve_status_menuitem);
 
  app.route("/admin/makeit/documentstore").post(makeituser.makeit_document_store);






  // Orders API
  app.route("/orders/ordercreate").post(orders.eatuser_order_create);

  //Sales API

  app.route("/sales/followupstatus").put(allocation.update_a_followupstatus);

  app.route("/sales/faq").get(faq.list_all_faq);

  app.route("/sales/rating").post(salesuser.create_a_rating);

  app.route("/sales/documentUpload").post(documents.upload_a_documents);

  app.route("/sales/documentCreate").post(salesdocument.create_a_new_documents);

  app.route("/sales/documentView").post(salesdocument.sales_document_view);

  app.route("/sales/document/remove").delete(documents.remove_s3_sales_doc);

  // Common

  // Moveit
  app.route("/moveit/faqs/:id").get(faq.list_all_faqbytype);

  app.route("/moveit/onlinestatus").put(moveituser.moveit_live_status);

  app
    .route("/moveit/orders/:moveit_user_id")
    .get(orders.orderlist_by_moveit_userid);

  app.route("/moveit/vorders/:orderid").get(orders.orderview);

  app.route("/moveit/orderpickupstatus").put(orders.order_pickup_status);

  app.route("/moveit/orderdeliverystatus").put(orders.order_delivery_status);

  app.route("/moveit/moveitstatus").put(orders.moveit_kitchen_reached);

  app.route("/moveit/makeitrating").put(moveituser.moveit_kitchen_rating);

  app
    .route("/moveit/qualitycheck")
    .post(moveituser.moveit_kitchen_qualitycheck);

  app.route("/moveit/paymentstatus").put(orders.order_payment_status);

  app
    .route("/moveit/ordershistory/:moveit_user_id")
    .get(orders.orderhistory_by_moveit_userid);

  app.route("/moveit/documentUpload").post(documents.moveit_upload_a_documents);

  app.route("/moveit/documentstore").post(moveitdocument.create_a_documents);

  app.route("/moveit/makeitrating").put(moveituser.moveit_kitchen_rating);

  app
    .route("/moveit/qualitychecklist")
    .post(moveituser.moveit_quality_checklist);

    app.route("/moveit/pushid/add").put(moveituser.add_a_pushid);

  // Eat

  // app.route('/eat/dishlist')
  //   .post(eatuser.eat_dish_list);

  // app.route('/eat/kitchenlist')
  //   .post(eatuser.eat_makeit_list);

  app.route("/eat/products").post(eatuser.eat_makeit_product_list);

  app.route("/eat/placeorder").post(orders.eatuser_order_create);

  app.route("/eat/order/:orderid").get(orders.order_view_eatuser);

  app.route("/eat/orders/:userid").get(orders.order_list_eatuser);

  app.route("/eat/address")
    .get(eatuseraddress.list_all_address)
    .post(eatuseraddress.create_a_address);

  app
    .route("/eat/address/:userid")
    .get(eatuseraddress.read_a_user_address_userid)
    // .put(eatuseraddress.update_a_user_address)
    .delete(eatuseraddress.delete_a_user_address);

  app
    .route("/eat/addresslist/:aid")
    .get(eatuseraddress.read_a_user_address_aid);

  app.route("/eat/address/").put(eatuseraddress.update_a_user_address);

  app.route("/eat/addressdelete").put(eatuseraddress.update_delete_status);

  app.route("/eat/makeituser/:userid").get(makeituser.read_a_user);

  app.route("/eat/order/add").post(orders.eatcreateOrder);

  app.route("/eat/orderplace").post(orders.online_order_place_conformation);

  app.route("/eat/cartdetails").post(makeituser.read_a_cartdetails);

  app.route("/eat/dishlist").post(eatuser.eat_dish_sort_filter);

  app.route("/eat/kitchenlist").post(eatuser.eat_kitchen_sort_filter);

  app.route("/eat/fav").post(fav.create_a_fav);

  app.route("/eat/fav/:id").delete(fav.delete_a_fav);

  app.route("/eat/fav/dishlist/:id").get(fav.read_a_fav_dishlist);

  app.route("/eat/fav/kitchenlist/:id").get(fav.read_a_fav_kitchenlist);

  app.route("/eat/liveorders/:userid").get(orders.live_order_list_byeatuser);

  app.route("/eat/proceedtopay").post(orders.read_a_proceed_to_pay);

  app.route("/eat/referral/:userid").get(eatuser.eat_user_referral);

  app.route("/eat/login").post(eatuser.eatuser_login);

  app.route("/eat/otpverification").post(eatuser.eatuser_otpverification);

  app.route("/eat/edit").put(eatuser.edit_eat_users);

  app
    .route("/eat/feedback")
    .get(feedback.list_all_feedback)
    .post(feedback.create_a_feedback);

  app.route("/eat/checklogin").post(eatuser.checklogin);

  app.route("/eat/postregistration").put(eatuser.eat_user_post_registration);

  app.route("/eat/forgot").post(eatuser.eat_user_forgot_password);

  app.route("/eat/password").put(eatuser.eat_user_forgot_password_update);

  app.route("/eat/rating").post(orderrating.createorderrating);

  app.route("/eat/pushid/add").put(eatuser.add_a_pushid);

  app
    .route("/eat/defaultaddress")
    .put(eatuseraddress.eat_user_default_address_update);

  app
    .route("/eat/payment/customerid")
    .get(eatuser.create_customerid_by_razorpay);

   app.route("/eat/region/kitchenlist").post(eatuser.eat_region_list_sort_filter);

   app.route("/eat/regionlist").post(eatuser.eat_region_list);
   
   app.route("/eat/kitche/showmore").post(eatuser.eat_region_kitchen_showmore);

   app.route("/eat/product/search").post(eatuser.eat_explore_dish);

 //  app.route("/eat/product/lockrelease").post(product.eat_product_lockrelease);



  //query common

  app.route("/query").post(queryquestion.create_a_question);

  app.route("/querylist").post(queryquestion.read_a_question);

  app.route("/repliescount").post(queryanswer.read_a_answer_count);

  app.route("/queryanswer").post(queryanswer.create_a_answer);

  app.route("/queryreplies/:aid").get(queryanswer.read_a_replies);

  app.route("/repliesread").put(queryanswer.update_read_answer);

  app.route("/masters").get(master.read_a_masters);

  app.route("/eat/explore").get(eatuser.eat_explore_store_data);
  

  // Masters

  app.route("/masters/regionlist").get(region.list_all_region);
  app.route("/masters/homedownlist").get(homedown.list_all_homedown);
  app.route("/masters/makeithub").get(makeithub.list_all_makeithubs);

  app.route("/masters/cuisinelist").get(cusine.list_all_Cuisine);
  

  app.route("/procedure").get(region.pro_call);

  /// temp

  app.route("/foodlist").post(eatuser.eat_makeit_product_list);

  app.route("/admin/order/testpush").post(orders.testPush);
};
