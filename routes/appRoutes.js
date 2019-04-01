'use strict';
module.exports = function(app) {

  //forever start server.js

  var todoList = require('../controllers/AppController');
  var eatuser = require('../controllers/eat/EatUserController');
  var moveituser = require('../controllers/moveit/MoveitUserController');
  var makeituser = require('../controllers/makeit/MakeitUserController');
  var salesuser = require('../controllers/sales/SalesUserController');
  var localities = require('../controllers/common/LocalitiesController');
  var documents = require('../controllers/common/DocumentsController');
  var menuitem = require('../controllers/makeit/MenuItemController');
  var product = require('../controllers/makeit/ProductController');
  var question = require('../controllers/sales/QuestionController');
  var fav = require('../controllers/eat/FavController');
  var faq = require('../controllers/common/FaqController');
  var allocation = require('../controllers/sales/AllocationController');
  var orders = require('../controllers/common/OrderController');
  var salesdocument = require('../controllers/common/DocumentsalesController');
  var moveitdocument = require('../controllers/common/DocumentmoveitController');
  var eatuseraddress = require('../controllers/eat/EatUserAddressController');

  // todoList Routes
  app.route('/tasks')
    .get(todoList.list_all_tasks)
    .post(todoList.create_a_task);
   
  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);

  //Routes for eat users

  app.route('/eatusers')
    .get(eatuser.list_all_eatuser)
    .post(eatuser.create_a_eatuser);

  app.route('/eatusers/:userid')
    .get(eatuser.read_a_user)
    .put(eatuser.update_a_user)
    .delete(eatuser.delete_a_user);

  

   //Routes for moveit users

  app.route('/moveitusers')
    .get(moveituser.list_all_user)
    .post(moveituser.create_a_user);

  app.route('/moveitusers/:userid')
    .get(moveituser.read_a_user)
    .put(moveituser.update_a_user)
    .delete(moveituser.delete_a_user);
  
  app.route('/moveit/registration')
    .post(moveituser.create_a_user);
  app.route('/moveit/login')
    .post(moveituser.checklogin)

   //Routes for makeit users

  app.route('/makeitusers')
    .get(makeituser.list_all_user)
    .post(makeituser.create_a_user);

  app.route('/makeitusers/:userid')
    .get(makeituser.read_a_user)
    .put(makeituser.update_a_user)
    .delete(makeituser.delete_a_user);

  app.route('/makeit/login')
    .post(makeituser.checklogin)

  app.route('/makeit/registration')
    .post(makeituser.create_a_user)

  app.route('/makeit/paymentregistration/:userid')
    .put(makeituser.update_payment_registration)

  // app.route('/makeit/bookappointment/:userid')
  //   .put(makeituser.creat_a_appointment)

    app.route('/makeit/bookappointment')
    .put(makeituser.creat_a_appointment)


 app.route('/makeit/appointments/')
    .get(makeituser.list_all_appointment)

   //Routes for Sales users

  app.route('/salesusers')
    .get(salesuser.list_all_user)
    .post(salesuser.create_a_user);

  app.route('/salesusers/:userid')
    .get(salesuser.read_a_user)
    .put(salesuser.update_a_user)
    .delete(salesuser.delete_a_user);


    app.route('/sales/login')
    .post(salesuser.checklogin)

    app.route('/sales/registration')
    .post(salesuser.create_a_user)
  

   //Routes for Common Api's

  app.route('/localities')
    .get(localities.list_all_locality)
    .post(localities.create_a_locality);

  app.route('/localities/:id')
    .get(localities.read_a_locality)
    .put(localities.update_a_locality)
    .delete(localities.delete_a_locality);

    //Documents

  app.route('/documents')
    .get(documents.list_all_documents)
    .post(documents.create_a_documents);

    
  app.route('/documents/:id')
    .get(documents.read_a_documents)
    .put(documents.update_a_documents)
    .delete(documents.delete_a_documents);

  app.route('/sales/trainingdocs')
    .get(documents.list_all_sales_training_documents);
    //.post(documents.create_a_sales_training_documents);

  app.route('/menuitem')
    .get(menuitem.list_all_menuitem)
    .post(menuitem.create_a_menuitem)
   

  app.route('/menuitem/:id')
    .get(menuitem.read_a_menuitem)
    .put(menuitem.update_a_menuitem)
    .delete(menuitem.delete_a_menuitem);

  app.route('/product')
    .get(product.list_all_product)
    .post(product.create_a_product);

   app.route('/vproduct')
   .get(product.list_all_virtual_product);

  app.route('/product/:id')
    .get(product.read_a_product)
    .put(product.update_a_product)
    .delete(product.delete_a_product);

  app.route('/question')
    .get(question.list_all_question)
    .post(question.create_a_question);

  app.route('/question/:id')
    .get(question.read_a_question)
    .put(question.update_a_question)
    .delete(question.delete_a_question);

  app.route('/questionsformakeit/:id')
    .get(question.read_questionsformakeit)

  app.route('/fav')
    .get(fav.list_all_fav)
    .post(fav.create_a_fav);

  app.route('/fav/:id')
    .get(fav.read_a_fav)
    .put(fav.update_a_fav)
    .delete(fav.delete_a_fav);

  app.route('/favforeatusers/:id')
    .get(fav.list_all_fav_eatusers)



   app.route('/allocation')
    .get(allocation.list_all_allocation)
    .post(allocation.create_a_allocation);

  app.route('/allocation/:id')
    .get(allocation.read_a_allocation)
    .put(allocation.update_a_allocation)
    .delete(allocation.delete_a_allocation);

  app.route('/allocation/salesempid/:id')
    .get(allocation.list_all_allocation_by_salesempid);

  app.route('/sales/tasklist/:id')
    .get(allocation.list_all_allocation_by_salesempid);





 app.route('/faqs/:id')
    .get(faq.list_all_faqbytype);

 app.route('/faq/')
    .get(faq.list_all_faq)
    .post(faq.create_a_faq);

app.route('/faq/:id')
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

    app.route('/makeit/orders')
    .get(makeituser.all_order_list);

    app.route('/makeit/orders/listbydate')
    .post(makeituser.all_order_list_bydate);

    app.route('/makeit/orders/:id')
      .get(makeituser.orderlist);

    app.route('/vorders/:orderid')
      .get(makeituser.orderview);
  
    app.route('/orders')
      .put(makeituser.orderstatus);
     
    app.route('/lproduct/:makeit_userid')
      .get(product.list_all_liveproduct);

    app.route('/product/moveliveproduct/')
      .post(product.moveliveproduct);

    app.route('/product/productitem/:productid')
      .get(product.productitemlist);

    app.route('/virtual/eatusers')
      .get(eatuser.list_all_virtual_eatuser)

    app.route('/virtual/:search')
      .get(eatuser.virtual_eatusersearch)

    app.route('/makeit/addquantity')
     .put(product.add_quantity);

    app.route('/makeit/addquantityandproductlive')
     .put(product.add_quantity_productlive);


      /*Admin Api*/
    app.route('/admin/eatuser/add')
      .post(eatuser.create_a_eatuser);

    app.route('/admin/eatusers/')
      .post(eatuser.list_all_virtual_eatuser);

    app.route('/admin/order/add')
      .post(orders.eatuser_order_create);

    app.route('/admin/orders')
      .post(orders.list_all_orders);

    app.route('/admin/order/:id')
      .get(orders.order_view);

    app.route('/admin/order/assign')
      .put(orders.order_assign);

    app.route('/admin/orders/unassign')
      .get(orders.un_assign_orders);

    app.route('/admin/product')
      .post(product.admin_list_all_product);

    app.route('/admin/makeitusers')
      .post(makeituser.admin_list_all_makeitusers);

    app.route('/admin/makeituser/approval')
      .put(makeituser.admin_makeit_user_approval);

    app.route('/admin/makeituser/add')
      .post(makeituser.create_a_user);

    app.route('/admin/salesuser/add')
      .post(salesuser.create_a_user);

    app.route('/admin/moveituser/add')
      .post(moveituser.create_a_user);

    app.route('/admin/appointments')
      .get(makeituser.list_all_appointment);

    app.route('/admin/appointment/assign')
      .post(allocation.create_a_allocation);

    app.route('/admin/eatuser/:userid')
      .get(eatuser.read_a_user)
      .put(eatuser.update_a_user)
      .delete(eatuser.delete_a_user);

    app.route('/admin/makeituser/:userid')
      .get(makeituser.read_a_user)
      .put(makeituser.update_a_user)
      .delete(makeituser.delete_a_user);
      
    app.route('/admin/salesusers')
      .post(salesuser.salesSearch);

    app.route('/admin/moveitusers')
      .post(moveituser.moveitSearch);

    app.route('/admin/salesuser/:userid')
      .get(salesuser.read_a_user)
      .put(salesuser.update_a_user)
      .delete(salesuser.delete_a_user);

    app.route('/admin/moveituser/:userid')
      .get(moveituser.admin_read_a_user)
      .put(moveituser.update_a_user)
      .delete(moveituser.delete_a_user);

    // app.route('/admin/moveit/documentUpload')
    //   .post(documents.upload_a_documents);
    
    app.route('/admin/sales/documentupload')
      .post(documents.sales_upload_a_documents);

    app.route('/admin/moveit/documentupload')
      .post(documents.moveit_upload_a_documents);
      
    app.route('/admin/moveit/documentstore')
      .post(moveitdocument.create_a_documents);

    app.route('/admin/item/add')
      .post(menuitem.create_a_menuitem);

    app.route('/admin/items/:id')
      .get(menuitem.read_a_menuitem);

    app.route('/admin/product/add')
      .post(product.create_a_product);

    app.route('/admin/liveproduct/:makeit_userid')
      .get(product.list_all_liveproduct);

   app.route('/admin/product/view/:productid')
      .get(product.productitemlist);

    app.route('/admin/product/movetolive')
      .post(product.moveliveproduct);

    app.route('/admin/makeituser/edit')
      .put(makeituser.update_makeit_users);
   




        // Orders API
    app.route('/orders/ordercreate')
      .post(orders.eatuser_order_create)


        //Sales API

    app.route('/sales/followupstatus')
      .put(allocation.update_a_followupstatus);

    app.route('/sales/faq')
      .get(faq.list_all_faq);

    app.route('/sales/rating')
      .post(salesuser.create_a_rating);

    app.route('/sales/documentUpload')
     .post(documents.upload_a_documents);

    app.route('/sales/documentCreate')
      .post(salesdocument.create_a_new_documents);

   app.route('/sales/documentView')
      .post(salesdocument.sales_document_view);

        
    app.route('/sales/document/remove')
     .delete(documents.remove_s3_sales_doc);

    // Common

    // Moveit
    app.route('/moveit/faqs/:id')
    .get(faq.list_all_faqbytype);

    app.route('/moveit/onlinestatus')
    .put(moveituser.moveit_live_status);

    app.route('/moveit/orders/:moveit_user_id')
    .get(orders.orderlist_by_moveit_userid);

    app.route('/moveit/vorders/:orderid')
      .get(orders.orderview);

    app.route('/moveit/orderpickupstatus')
      .put(orders.order_pickup_status);

    app.route('/moveit/orderdeliverystatus')
      .put(orders.order_delivery_status);

    app.route('/moveit/moveitstatus')
      .put(orders.moveit_kitchen_reached);

    app.route('/moveit/makeitrating')
      .put(moveituser.moveit_kitchen_rating);

    app.route('/moveit/qualitycheck')
      .post(moveituser.moveit_kitchen_qualitycheck);

    app.route('/moveit/paymentstatus')
      .put(orders.order_payment_status);

    app.route('/moveit/ordershistory/:moveit_user_id')
      .get(orders.orderhistory_by_moveit_userid);

    app.route('/moveit/documentUpload')
      .post(documents.moveit_upload_a_documents);

    app.route('/moveit/documentstore')
      .post(moveitdocument.create_a_documents);
    
    app.route('/moveit/makeitrating')
      .put(moveituser.moveit_kitchen_rating);
    
    app.route('/moveit/qualitychecklist')
      .post(moveituser.moveit_quality_checklist);

    // Eat

    app.route('/eat/dishlist')
    .post(eatuser.eat_dish_list);

    app.route('/eat/kitchenlist')
    .post(eatuser.eat_makeit_list);

    app.route('/eat/products')
    .post(eatuser.eat_makeit_product_list);

    app.route('/eat/placeorder')
    .post(orders.eatuser_order_create);

    app.route('/eat/order/:orderid')
      .get(orders.order_view_eatuser);

    app.route('/eat/orders/:userid')
      .get(orders.order_list_eatuser);


    //Eat user Address
    app.route('/eat/address')
    .get(eatuseraddress.list_all_address)
    .post(eatuseraddress.create_a_address);
   
     app.route('/eat/address/:userid')
    .get(eatuseraddress.read_a_user_address)
    .put(eatuseraddress.update_a_user_address)
    .delete(eatuseraddress.delete_a_user_address);

    app.route('/eat/addressdelete')
    .put(eatuseraddress.update_delete_status);

    app.route('/eat/makeituser/:userid')
      .get(makeituser.read_a_user)
   
    };

   