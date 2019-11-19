'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');
var request = require('request');
const https = require('https')



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


//task create
Dunzo.dunzo_task_create = async function dunzo_task_create(req,result) {

  
    //var url ='https://apis-staging.dunzo.in/api/v1/tasks?test=true';
  
    //set form data
    var form = {
       request_id: "1006",
      // pickup_details: {
      //   lat: 13.041794,
      //   lng: 80.229038,
      //   address: {
      //     apartment_address : "200 Block 4",
      //     street_address_1: "Suncity Apartments",
      //     street_address_2: "Bellandur",
      //     landmark: "Iblur lake",
      //     city: "chennai",
      //     state: "tamilnadu",
      //     pincode: "600010",
      //     country: "India"
      //   }
      // },
      // drop_details: {
      //   "lat": 13.047553,
      //   "lng": 80.237139,
      //   "address": {
      //     "apartment_address" : "204 Block 4",
      //     "street_address_1": "Suncity Apartments",
      //     "street_address _2": "Bellandur",
      //     "landmark": "Iblur lake",
      //     "city": "chennai",
      //     "state": "tamilnadu",
      //     "pincode": "600010",
      //     "country": "India"
      //   }
      // },
      // sender_details: {
      //   "name": "Puneet",
      //   "phone_number": "9999999999"
      // },
      // receiver_details: {
      //   "name": "Vijendra",
      //   "phone_number": "9999999998"
      // },
      // package_content: ["Documents | Books", "Clothes | Accessories", "Electronic Items"],
      // package_approx_value: 250,
      // special_instructions: "Fragile items. Handle with great care!!"
    }
   // console.log(JSON.parse(form));
    var headers= {
             'Content-Type': 'application/json',
             'client-id': dunzoconst.dunzo_client_id,
             'Authorization' : dunzoconst.Authorization,
             'Accept-Language':'en_US'
           };
  
  //set request parameter
  request.post({headers: headers, url: 'https://apis-staging.dunzo.in/api/v1/tasks?test=true', body: JSON.parse(form), method: 'POST'}, function (e, r, body) {
  
      var bodyValues = JSON.parse(body);
      console.log('error:', e); // Print the error if one occurred
      console.log('statusCode:', r && r.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      console.log("====================================");
      //res.send(bodyValues);
      let resobj = {
                 success: true,
                 status: true,
                 result: bodyValues
               };
               result(null, resobj);
  });
};


////task cancel
Dunzo.dunzo_task_cancel = async function dunzo_task_cancel(req,result) {

    var url ='https://apis-staging.dunzo.in/api/v1/tasks/9f62d62a-3a25-4b5e-8977-d695202a6002/_cancel?test=true';
  
    var headers= {
             'Content-Type': 'application/json',
             'client-id': dunzoconst.dunzo_client_id,
              'Authorization' : dunzoconst.Authorization,
            //  'Accept-Language':'en_US'y
           };
  
  
           request.post({
            headers: headers,
            url:     'https://apis-staging.dunzo.in/api/v1/tasks/9f62d62a-3a25-4b5e-8977-d695202a6002/_cancel?test=true',
            body:    {'cancellation_reason': "Changed my mind"}
          }, function(error, response, body){
             console.log("response: ", response);

                  let resobj = 
                        {
                         success: true,
                         status: true,
                        result: body
                        };
                result(null, resobj);
          });
          
        //   function(error, response, body) {
        //     if (error) {
        //       console.log("error: ", err);
        //       result(null, err);
        //     } else {
        //       console.log(response.statusCode, body);
             
        //       let resobj = 
        //                 {
        //                  success: true,
        //                  status: true,
        //                 result: response
        //                 };
        //         result(null, resobj);
             
        //     }
        //   }
       // );


//   //set request parameter
//   request.post({options}, function (e, r, body) {
  

//       console.log('error:', e); // Print the error if one occurred
//       console.log('statusCode:', r && r.statusCode); // Print the response status code if a response was received
//       console.log('body:', body); // Print the HTML for the Google homepage.
//       console.log("====================================");
//       //res.send(bodyValues);
//       let resobj = {
//                  success: true,
//                  status: true,
//                  result: bodyValues
//                };
//                result(null, resobj);
//   });
};

module.exports= Dunzo;