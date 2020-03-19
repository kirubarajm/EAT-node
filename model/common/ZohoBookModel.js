"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
const constant = require('../constant.js');
const sessionstorage = require('sessionstorage');
const request = require('request');

//Task object constructor
var ZohoBookModel = function(zohoreq) {
  this.orderid = zohoreq.orderid;
  this.userid = zohoreq.userid;
  this.zoho_customer_id = zohoreq.zoho_customer_id;
};

ZohoBookModel.createzohorequest =async function createzohorequest(req, result) {
  
};

ZohoBookModel.createZohoAccessToken =function createZohoAccessToken(req, result) {
  
};

ZohoBookModel.createZohoRefreshToken =function createZohoRefreshToken(req, result) {
  var headers= {
    'Content-Type': 'application/json',
   };
   var userdetails={
    refresh_token:constant.zoho_refresh_token,
    client_id:constant.zoho_client_id,
    client_secret:constant.zoho_client_secret,
    grant_type:constant.zoho_grant_type
   }
   request.post({headers: headers, url:constant.zoho_auth_api, json: userdetails,method: 'POST'},async function (e, r, body) {
     console.log("body-->",body);
     console.log("e-->",e);
     console.log("r-->",r);
     sessionstorage.setItem("access_token_responce",body);
  });
};

ZohoBookModel.createZohoCustomer =async function createZohoCustomer(req, result) {
  
  await ZohoBookModel.createZohoRefreshToken();
  var session=sessionstorage.getItem("access_token_responce");
  console.log("session-->",session);
  //ZohoBookModel.createZohoRefreshToken
};



module.exports = ZohoBookModel;
