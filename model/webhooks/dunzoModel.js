'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');
var request = require('request');
const https = require('https');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var Dunzoresponce = require("../../model/common/dunzoresponceModel");
var Dunzomoveitdetails = require("../../model/common/dunzomoveitdetailsModel");
var moment = require("moment");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");







//Task object constructor
var Dunzo = function(dunzo){
    this.makeit_userid = dunzo.makeit_userid;
    this.rating = dunzo.rating;
};

Dunzo.testingapi = function testingapi(req, result) {
    //console.log(dunzoconst);
    switch(req.state){
        case dunzoconst.created:
            console.log("created");
            break;
        case dunzoconst.queued:
            console.log("queued");
            break;
        case dunzoconst.runner_accepted:
            console.log("runner_accepted");
            break;
        case dunzoconst.runner_cancelled:
            console.log("runner_cancelled");
            break;
        case dunzoconst.reached_for_pickup:
            console.log("reached_for_pickup");
            break; 
        case dunzoconst.pickup_complete:
            console.log("pickup_complete");
            break;
        case dunzoconst.started_for_delivery:
            console.log("started_for_delivery");
            break;
        case dunzoconst.reached_for_delivery:
            console.log("reached_for_delivery");
            break;
        case dunzoconst.delivered:
            console.log("delivered");
            break;
        case dunzoconst.cancelled:
            console.log("cancelled");
            break;         
        default:
            console.log("No State");
    }
    result(null, req);
};

//controller for create_Dunzoresponce
Dunzo.create_Dunzoresponce = function create_Dunzoresponce(dunzo_responce) {
   var new_Dunzoresponce = new Dunzoresponce(dunzo_responce);
  // new_Dunzoresponce.task_id= dunzo_responce[0];
  Dunzoresponce.create_Dunzoresponce(new_Dunzoresponce, function(err, res) {
    if (err) return err;
    else return res;
  });
};




// controller for moveit details
Dunzo.create_Dunzomoveitdetails = function create_Dunzomoveitdetails(Dunzomoveitdetails_data) {
  var new_Dunzomoveitdetails = new Dunzomoveitdetails(Dunzomoveitdetails_data);
 // new_Dunzoresponce.task_id= dunzo_responce[0];
 Dunzomoveitdetails.create_Dunzomoveitdetails(new_Dunzomoveitdetails, function(err, res) {
   if (err) return err;
   else return res;
 });
};

//Dunzo next state update
Dunzo.dunzo_nex_state_update_by_taskid =async function dunzo_nex_state_update_by_taskid(req, result) {

  var dunzo_data = {};
  //dunzo_responce.task_id = req.task_id;
 // dunzo_responce.push(req);
 dunzo_data.task_id = req.task_id;
 dunzo_data.dunzo_responce = JSON.stringify(req);
//store dunzo all request
 Dunzo.create_Dunzoresponce(dunzo_data);
 const orderdetails = await query("select * from Orders where dunzo_taskid ='" +req.task_id+ "'");

  switch(req.state){
      case dunzoconst.created:
          console.log("created");
          break;
      case dunzoconst.queued:
          console.log("queued");
          break;
      case dunzoconst.runner_accepted:
          console.log("runner_accepted");
          //store dunzo moveit details
          var Dunzomoveitdetails_data =  {};
          Dunzomoveitdetails_data.task_id = req.task_id;
          Dunzomoveitdetails_data.runner_state = req.state;
          Dunzomoveitdetails_data.runner_name = req.runner.name;
          Dunzomoveitdetails_data.runner_phone_number = req.runner.phone_number;
          Dunzomoveitdetails_data.runner_lat = req.runner.location.lat;
          Dunzomoveitdetails_data.runner_lng = req.runner.location.lat;
          Dunzomoveitdetails_data.runner_eta_pickup_min = req.eta.pickup;
          Dunzomoveitdetails_data.runner_eta_dropoff_min = req.eta.dropoff;

          Dunzo.create_Dunzomoveitdetails(Dunzomoveitdetails_data);

              if (orderdetails.length !== 0) {
                console.log(orderdetails[0].orderid);

           //     if (orderdetails[0].moveit_status < 1 ) {
                
                  var orderaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
               
                  updatequery ="UPDATE Orders SET moveit_status = 1 ,moveit_accept_time= '" + orderaccepttime +"' WHERE orderid ='" +orderdetails[0].orderid +"'";
                  const updatestatus = await query(updatequery);

                  let response = {
                    success: true,
                    status: true,
                    message: "Order accepted successfully."
                  };
                 
                  result(null, response);
               
               // } else if (orderdetails[0].moveit_status == 1) {
                  // let response = {
                  //   success: true,
                  //   status: false,
                  //   message: "Sorry your order already accepted"
                  // };
                  // result(null, response);
                // } else {
                //   let response = {
                //     success: true,
                //     status: false,
                //     message: "Following order is not assigned to you!"
                //   };
                //   result(null, response);
                // }
              } else {
                let response = {
                  success: true,
                  status: false,
                  message: "Order is not available!"
                };
                result(null, response);
              }
          //  };
          break;
      case dunzoconst.runner_cancelled:
          console.log("runner_cancelled");
          break;
      case dunzoconst.reached_for_pickup:
          console.log("reached_for_pickup");

         // Order.moveit_kitchen_reached_status = function(req, result) {
            var kitchenreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
            updatequery ="UPDATE Orders  SET moveit_reached_time = '" +kitchenreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
            const updatekitchenreachtime = await query(updatequery);
                  let resobj = {
                    success: true,
                    status:true,
                    message: "kitchen reached successfully"
                  };
                 

             result(null, resobj);

          break; 
      case dunzoconst.pickup_complete:
          console.log("pickup_complete");
          
         // Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
            var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");
            var twentyMinutesLater = moment().add(0, "seconds").add(req.eta.dropoff, "minutes").format("YYYY-MM-DD HH:mm:ss");
          
            if (orderdetails.length !==0) {     
              if (orderdetails[0].orderstatus == 7) {
                let resobj = {
                  success: true,
                  status:false,
                  message: "Sorry! This order already canceled."
                };
                
                result(null, resobj);
               // return;
              }else if (orderdetails[0].orderstatus < 3 ) {
                let resobj = {
                  success: true,
                  status:false,
                  message: "Please wait food not yet prepared"
                };
                result(null, resobj);
              //  return;
              }else{
           
                updatequery ="UPDATE Orders  SET orderstatus = 5 ,moveit_pickup_time = '" +order_pickup_time+"',moveit_expected_delivered_time = '" +twentyMinutesLater +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
                const updatestatuspickup = await query(updatequery);
                      let resobj = {
                        success: true,
                        status: true,
                        message: "Order Pickedup successfully"
                      };
                      PushConstant.Pageid_eat_order_pickedup = 5;
                      await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
       
                 result(null, resobj);
        
              }
            }else{
              let response = {
                success: true,
                status: false,
                message: "Order not found.",
             
              };
              result(null, response);
            }
         // };

        
          break;
      case dunzoconst.started_for_delivery:
          console.log("started_for_delivery");

         
          break;
      case dunzoconst.reached_for_delivery:
          console.log("reached_for_delivery");

          var customerlocationreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
          
          updatequery ="UPDATE Orders SET moveit_customerlocation_reached_time  = '" +customerlocationreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
          const updatecustomerlocationreachtime = await query(updatequery);
                let data = {
                  success: true,
                  status: true,
                  message: "Customer location reached successfully"
                };
                PushConstant.Pageid_eat_order_pickedup = 6;
                await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
           result(null, data);

          
          break;
      case dunzoconst.delivered:
          console.log("delivered");

       //   Order.order_delivery_status_by_moveituser = async function(req, result) {
            var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
            if (orderdetails.length !== 0) {
          
              if (orderdetails[0].orderstatus == 6) {
                let resobj = {
                  success: true,
                  message: "Sorry!  order was already deliverd.",
                  status:false
                };
                result(null, resobj);
              }else if (orderdetails[0].orderstatus == 7) {
                let resobj = {
                  success: true,
                  message: "Sorry!  order already canceled.",
                  status:false
                };
                result(null, resobj);
              }else{
    
              if (orderdetails[0].payment_status == 1) {
                updatequery ="UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = '" +order_delivery_time+"' WHERE orderid ='" +orderdetails[0].orderid +"'";
                const updatestatusdeliverd = await query(updatequery);
                      let deliverd = {
                        success: true,
                        status: true,
                        message: "Order delivered successfully",
                        orderdeliverystatus: true
                      };

                      PushConstant.Pageid_eat_order_pickedup = 7;
                      await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
          
                     
                 result(null, deliverd);

              } else {
                let resobj = {
                  success: true,
                  status:false,
                  message: "Payment not yet paid!",
                  orderdeliverystatus: false
                };
                result(null, resobj);
              }
            }
            } else {
              let resobj = {
                success: true,
                message: "Orders not found!.",
                status:false
              };
              result(null, resobj);
            }
         // };
        
          break;
      case dunzoconst.cancelled:
          console.log("cancelled");
          var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +orderdetails[0].orderid+"");
          updatequery =await query("UPDATE Orders SET moveit_status = 0  WHERE orderid ='" +orderdetails[0].orderid +"'");

          let orderqueue = {
            success: true,
            message: "Order again pushed into queue.",
            status:true
          };
          result(null, orderqueue);
          break;         
      default:
          console.log("No State");
  }
  //result(null, req);
};


//task create
Dunzo.dunzo_task_create = async function dunzo_task_create(orderid,result) {
    //var url ='https://apis-staging.dunzo.in/api/v1/tasks?test=true';

   // var orderquery =  "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid ="+orderid +" ";
   // order_details = await query(orderquery);
   var order_details = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1,'landmark',ms.landmark,'flatno',ms.flatno,'pincode',ms.pincode,'locality',ms.locality) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid ="+orderid +" ");

   if (order_details[0].userdetail) {
    order_details[0].userdetail = JSON.parse(order_details[0].userdetail);
  }

  if (order_details[0].makeitdetail) {
    order_details[0].makeitdetail = JSON.parse(order_details[0].makeitdetail);
  }
  if (order_details[0].moveitdetail) {
    order_details[0].moveitdetail = JSON.parse(order_details[0].moveitdetail);
  }

  if (order_details[0].items) {
    var items = JSON.parse(order_details[0].items);
    order_details[0].items = items.item;
  }


    //set form data
    var form = {
      request_id: order_details[0].orderid.toString(),
      pickup_details: {
        lat:order_details[0].makeitdetail.lat,
        lng: order_details[0].makeitdetail.lon,
        address: {
          apartment_address : order_details[0].makeitdetail.flatno,
          street_address_1: order_details[0].makeitdetail.address,
          street_address_2: order_details[0].makeitdetail.address,
          landmark: order_details[0].makeitdetail.landmark,
          city: order_details[0].makeitdetail.locality,
          state: "tamilnadu",
          pincode: order_details[0].makeitdetail.pincode,
          country: "India"
        }
      },
      drop_details: {
        lat: parseFloat(order_details[0].cus_lat),
        lng: parseFloat(order_details[0].cus_lon),
        address: {
          apartment_address : order_details[0].flatno,
          street_address_1: order_details[0].cus_address,
          street_address_2: order_details[0].cus_address,
          landmark: order_details[0].landmark,
          city: order_details[0].locality,
          state: "tamilnadu",
          pincode: order_details[0].cus_pincode,
          country: "India"
        }
      },
      sender_details: {
        name:  order_details[0].makeitdetail.name,
        phone_number:  order_details[0].makeitdetail.phoneno
      },
      receiver_details: {
        name: order_details[0].userdetail.name,
        phone_number: order_details[0].userdetail.phoneno
      },
     package_content: ["Documents | Books", "Clothes | Accessories", "Electronic Items"],
     // package_content: ["Food"],
      package_approx_value: order_details[0].price,
      special_instructions: "Fragile items. Handle with great care!!"
    }
    //console.log(form);
    //console.log("parse-------",JSON.parse(form));
    //console.log("Str----",JSON.stringify(form));
    var headers= {
      'Content-Type': 'application/json',
      'client-id': dunzoconst.dunzo_client_id,
      'Authorization' : dunzoconst.Authorization,
      'Accept-Language':'en_US'
    };
  
    console.log(order_details[0].makeitdetail.pincode);
    //set request parameter
    request.post({headers: headers, url: dunzoconst.dunzo_create_url, json: form, method: 'POST'},async function (e, r, body) {
      console.log(body);
    if (body.state=="created") {
      console.log("created");

      var order_queue_update = await query("update Orders_queue set status = 1 where orderid =" +orderid+"");
      var order_update = await query("update Orders set moveit_status=1,dunzo_taskid ='"+body.task_id+"',delivery_vendor=1  where orderid =" +orderid+"");

    } else if (body.code="unserviceable_location_error") {
      console.log("unserviceable_location_error");

      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +orderid+"");
    }else if (body.code="duplicate_request") {
      console.log("duplicate_request");

      //var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");
    }else if (body.code="different_city_error") {
      console.log("different_city_error");

      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");
    }else if (body.code="rain_error") {
      console.log("rain_error");

      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");
    }else if (body.code="service_unavailable") {
      console.log("service_unavailable");

      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");
    }else if(body.code="validation_failed") {
      console.log("validation_failed");

      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");

    }    
    

      let resobj = {
        success: true,
        status: true,
        message : body.message,
        result: body
      };
      result(null, resobj);
    });
};

////task cancel
Dunzo.dunzo_task_cancel = async function dunzo_task_cancel(dunzo_taskid,result) {
  var url ='https://apis-staging.dunzo.in/api/v1/tasks/'+dunzo_taskid+'/_cancel?test=true'
  
  //set form data
  var form = {
    cancellation_reason: "runner is not available"
  }
  //console.log(form);
  //console.log("parse-------",JSON.parse(form));
  //console.log("Str----",JSON.stringify(form));
  var headers= {
    'Content-Type': 'application/json',
    'client-id': dunzoconst.dunzo_client_id,
    'Authorization' : dunzoconst.Authorization,
    'Accept-Language':'en_US'
  };

  //set request parameter
  request.post({headers: headers, url: url, json: form, method: 'POST'},async function (e, r, body) {
  


  });
};



module.exports= Dunzo;