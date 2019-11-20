'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');
var request = require('request');
const https = require('https');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var Order = require("../../model/common/orderModel.js");
var Dunzoresponce = require("../../model/common/dunzoresponceModel");




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
  // var new_Dunzoresponce = new Dunzoresponce(dunzo_responce);
  var new_Dunzoresponce = {};
  new_Dunzoresponce.dunzo_responce=[];
   new_Dunzoresponce.dunzo_responce = dunzo_responce;
   console.log(new_Dunzoresponce);
  // new_Dunzoresponce.task_id= dunzo_responce[0];
  Dunzoresponce.create_Dunzoresponce(new_Dunzoresponce, function(err, res) {
    if (err) return err;
    else return res;
  });
};

//Dunzo next state update
Dunzo.dunzo_nex_state_update_by_taskid =async function dunzo_nex_state_update_by_taskid(req, result) {

  var dunzo_responce = [];
  //dunzo_responce.task_id = req.task_id;
  dunzo_responce.push(req);
  dunzo_responce[0].task_id = req.task_id;
  //console.log("dunzo_responce"+dunzo_responce[0]);

 // Dunzo.create_Dunzoresponce(dunzo_responce[0]);
  switch(req.state){
      case dunzoconst.created:
          console.log("created");
          break;
      case dunzoconst.queued:
          console.log("queued");
          break;
      case dunzoconst.runner_accepted:
          console.log("runner_accepted");
          const orderdetails = await query("select * from Orders where dunzo_taskid ='" +req.task_id+ "'");
          order_data = {};
          order_data.orderid=orderdetails[0].orderid;
          order_data.dunzo_taskid=orderdetails[0].dunzo_taskid;
          order_data.delivery_vendor=orderdetails[0].delivery_vendor;
          order_data.moveit_user_id=orderdetails[0].moveit_user_id;

          Order.moveit_order_accept(order_data);
        

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


//task create
Dunzo.dunzo_task_create = async function dunzo_task_create(orderid,result) {
    //var url ='https://apis-staging.dunzo.in/api/v1/tasks?test=true';

   // var orderquery =  "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid ="+orderid +" ";
   // order_details = await query(orderquery);
   var order_details = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1,'landmark',ms.landmark,'flatno',ms.flatno,'pincode',ms.pincode) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid ="+orderid +" ");

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
          street_address_2: "Suncity Apartments",
          landmark: order_details[0].makeitdetail.landmark,
          city: "chennai",
          state: "tamilnadu",
          pincode: "600010",
          country: "India"
        }
      },
      drop_details: {
        lat: parseFloat(order_details[0].cus_lat),
        lng: parseFloat(order_details[0].cus_lon),
        address: {
          apartment_address : order_details[0].flatno,
          street_address_1: order_details[0].cus_address,
          street_address_2: "Suncity Apartments",
          landmark: order_details[0].landmark,
          city: "chennai",
          state: "tamilnadu",
          pincode: "600010",
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
  
    //set request parameter
    request.post({headers: headers, url: 'https://apis-staging.dunzo.in/api/v1/tasks?test=true', json: form, method: 'POST'},async function (e, r, body) {
      console.log(body.state);
    if (body.state=="created") {
      var order_queue_update = await query("update Orders_queue set status = 1 where orderid =" +orderid+"");
      var order_update = await query("update Orders set dunzo_taskid ='"+body.task_id+"',delivery_vendor=1  where orderid =" +orderid+"");

    } else if (body.code="unserviceable_location_error") {
      var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +orderid+"");
    }else if (body.code="duplicate_request") {
      //var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +req.orderid+"");
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
  
  console.log("url"+url);
  //set form data
  var form = {
    cancellation_reason: "Changed my mind"
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
  

    // let resobj = {
    //   success: true,
    //   status: true,
    //   result: body
    // };
    // result(null, resobj);
  });
};



module.exports= Dunzo;