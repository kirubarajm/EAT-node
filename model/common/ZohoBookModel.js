"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
const constant = require('../constant.js');
const sessionstorage = require('sessionstorage');
const request = require('request');
var querystring = require('querystring');

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
ZohoBookModel.createZohoRefreshToken =function createZohoRefreshToken(callback) {
  var headers= {
    'Content-Type': 'application/json',
   };
   var userdetails={
    refresh_token:constant.zoho_refresh_token,
    client_id:constant.zoho_client_id,
    client_secret:constant.zoho_client_secret,
    redirect_uri:constant.zoho_redirect_uri,
    grant_type:constant.zoho_grant_type
   }
   //console.log("userdetails-->",userdetails);
   var formData = querystring.stringify(userdetails);
   request.post({headers: headers, url:constant.zoho_auth_api, form: formData,method: 'POST'},async function (e, r, body) {
      console.log("body-->",body);
      //console.log("e-->",e);
      //console.log("r-->",r);
      //{"access_token":"1000.a01929f28d984aa4e5ab352af8faeaa8.af12981fcad6e02b6ed7c0e46dd64b65",
      //"api_domain":"https://www.zohoapis.in","token_type":"Bearer","expires_in":3600}
      var Jsonvalur= JSON.parse(body);
      sessionstorage.setItem("access_token_responce",Jsonvalur.access_token);
      callback();
  });
};
ZohoBookModel.createZohoCustomer =async function createZohoCustomer(req, result) {
  console.log("createZohoCustomer-->");
  
   var getUserDetail = await query("select ors.userid,us.zoho_book_customer_id,zoho_book_address_id,us.name,us.email,us.phoneno,pt.productid,pt.product_name,ori.quantity,ori.price,(ori.quantity*ori.price) AS amount,ors.payment_type,ors.delivery_vendor,ors.cus_address,ors.cus_pincode,ors.locality from Orders ors left join User us on us.userid=ors.userid left join OrderItem ori on ori.orderid=ors.orderid left join Product pt on pt.productid=ori.productid where ors.orderid="+req.orderid);
   if(getUserDetail[0].zoho_book_customer_id){
    req.userdetails=getUserDetail[0];
    req.items=getUserDetail;
    req.customer_id=getUserDetail[0].zoho_book_customer_id;
    req.address_id=getUserDetail[0].zoho_book_address_id;
    console.log("req-->",req);
    ZohoBookModel.updateShippingAddress(req,result);
   }else{
    req.userdetails=getUserDetail[0];
    req.items=getUserDetail;
    var session=sessionstorage.getItem("access_token_responce");
    if(!session){
        ZohoBookModel.createZohoRefreshToken(function(){
          ZohoBookModel.createZohoCustomer(req,result);
        });
     }else{
        ZohoBookModel.zohoGenrateCustomer(req,result);
     }
   }
};
ZohoBookModel.zohoGenrateCustomer =async function zohoGenrateCustomer(req, result) {
  //cus_address,ors.cus_pincode,ors.locality
  var userdetails={JSONString:'{"contact_name":"'+req.userdetails.name+'","contact_type":"customer","gst_treatment":"consumer","place_of_contact":"TN","customer_sub_type":"individual","shipping_address":{"address":"'+req.userdetails.cus_address+'","zip":"'+req.userdetails.cus_pincode+'","city":"chennai","state":"TN","country":"India"},"contact_persons":[{"first_name":"'+req.userdetails.name+'","last_name":"","email":"'+req.userdetails.email+'","mobile":"'+req.userdetails.phoneno+'","is_primary_contact":true}]}'}
  console.log("userdetails-->",userdetails);
  var formData = querystring.stringify(userdetails);
  var Contact_url=constant.zoho_base_api+"contacts?organization_id="+constant.organization_id;
  var session=sessionstorage.getItem("access_token_responce");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':'Zoho-oauthtoken '+session
   };

  request.post({headers: headers, url:Contact_url, form: formData,method: 'POST'},async function (e, r, body) {
    console.log("body-->",body);
      var Jsonvalur= JSON.parse(body);
      if(Jsonvalur.code === 57){
        ZohoBookModel.createZohoRefreshToken(function(){
          ZohoBookModel.zohoGenrateCustomer(req,result);
        });
      }else{
        var customer_id=Jsonvalur.contact.contact_id;
        var address_id=Jsonvalur.contact.shipping_address.address_id;
        var updatedetails = await query("update User set zoho_book_customer_id= '"+customer_id+"',zoho_book_address_id= '"+address_id+"' where userid = "+req.userdetails.userid+ " ")
        req.customer_id=customer_id;
        req.address_id=address_id;
        ZohoBookModel.zohoGetItemList(req,result);
      }
  });

  //ZohoBookModel.createZohoRefreshToken();
  //var session=sessionstorage.getItem("access_token_responce");
  //{"code":0,"message":"The contact has been added.","contact":{"contact_id":"248845000000043016","contact_name":"Basheer A","company_name":"","first_name":"","last_name":"","designation":"","department":"","website":"","language_code":"","language_code_formatted":"","contact_salutation":"","email":"","phone":"","mobile":"","portal_status":"disabled","is_client_review_asked":false,"has_transaction":false,"contact_type":"customer","customer_sub_type":"business","owner_id":"","owner_name":"","source":"api","documents":[],"twitter":"","facebook":"","is_crm_customer":false,"is_linked_with_zohocrm":false,"primary_contact_id":"","zcrm_account_id":"","zcrm_contact_id":"","crm_owner_id":"","payment_terms":0,"payment_terms_label":"Due On Receipt","credit_limit_exceeded_amount":0.00,"currency_id":"248845000000000064","currency_code":"INR","currency_symbol":"₹","price_precision":2,"exchange_rate":"","can_show_customer_ob":true,"can_show_vendor_ob":true,"opening_balance_amount":0.00,"opening_balance_amount_bcy":"","outstanding_ob_receivable_amount":0.00,"outstanding_ob_payable_amount":0.00,"outstanding_receivable_amount":0.00,"outstanding_receivable_amount_bcy":0.00,"outstanding_payable_amount":0.00,"outstanding_payable_amount_bcy":0.00,"unused_credits_receivable_amount":0.00,"unused_credits_receivable_amount_bcy":0.00,"unused_credits_payable_amount":0.00,"unused_credits_payable_amount_bcy":0.00,"unused_retainer_payments":0.00,"status":"active","payment_reminder_enabled":true,"is_sms_enabled":true,"is_client_review_settings_enabled":false,"custom_fields":[],"custom_field_hash":{},"is_taxable":true,"tax_id":"","tds_tax_id":"","tax_name":"","tax_percentage":"","country_code":"","place_of_contact":"TN","gst_no":"","pan_no":"","vat_reg_no":"","tax_treatment":"business_gst","tax_reg_no":"","contact_category":"business_gst","gst_treatment":"business_gst","sales_channel":"direct_sales","ach_supported":false,"portal_receipt_count":0,"tax_info_list":[],"billing_address":{"address_id":"248845000000043018","attention":"","address":"","street2":"","city":"","state_code":"","state":"","zip":"","country":"","phone":"","fax":""},"shipping_address":{"address_id":"248845000000043020","attention":"","address":"","street2":"","city":"","state_code":"","state":"","zip":"","country":"","phone":"","fax":""},"contact_persons":[],"addresses":[],"pricebook_id":"","pricebook_name":"","default_templates":{"invoice_template_id":"","invoice_template_name":"","bill_template_id":"","bill_template_name":"","estimate_template_id":"","estimate_template_name":"","creditnote_template_id":"","creditnote_template_name":"","purchaseorder_template_id":"","purchaseorder_template_name":"","salesorder_template_id":"","salesorder_template_name":"","paymentthankyou_template_id":"","paymentthankyou_template_name":"","invoice_email_template_id":"","invoice_email_template_name":"","estimate_email_template_id":"","estimate_email_template_name":"","creditnote_email_template_id":"","creditnote_email_template_name":"","purchaseorder_email_template_id":"","purchaseorder_email_template_name":"","salesorder_email_template_id":"","salesorder_email_template_name":"","paymentthankyou_email_template_id":"","paymentthankyou_email_template_name":"","payment_remittance_email_template_id":"","payment_remittance_email_template_name":""},"associated_with_square":false,"cards":[],"checks":[],"bank_accounts":[],"vpa_list":[],"notes":"","created_time":"2020-03-19T18:38:27+0530","last_modified_time":"2020-03-19T18:38:27+0530","tags":[],"zohopeople_client_id":""}}
  //ZohoBookModel.createZohoRefreshToken
};
ZohoBookModel.zohoGetItemList =async function zohoGetItemList(req, result) {

  var Contact_url=constant.zoho_base_api+"items?organization_id="+constant.organization_id;
  var session=sessionstorage.getItem("access_token_responce");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':'Zoho-oauthtoken '+session
   };
  request.get({headers: headers, url:Contact_url,method: 'GET'},async function (e, r, body) {
    
      var Jsonvalur= JSON.parse(body);
      if(Jsonvalur.code === 57){
        ZohoBookModel.createZohoRefreshToken(function(){
          ZohoBookModel.zohoGetItemList(req,result);
        });
      }else{
        var items=Jsonvalur.items;
        req.zoho_items=items;
        ZohoBookModel.createZohoItem(req,result);
      }
  });
};

ZohoBookModel.getItemIds =function getItemIds(Items,reqZohoItems,i,zohoitems,result) {
  var session=sessionstorage.getItem("access_token_responce");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':'Zoho-oauthtoken '+session
   };
  var item=Items[i];
  
  if(i<(reqZohoItems.length-1)){
    var zohoflItem = reqZohoItems.filter(zohoit => zohoit.name===item.product_name);
    if(zohoflItem.length>0){
      var itemIN={};
      itemIN.item_id=zohoflItem[0].item_id;
      itemIN.account_id=zohoflItem[0].account_id;
      itemIN.quantity=item.quantity;
      itemIN.tax_id="248845000000007222";
      zohoitems.push(itemIN);
      if(i!==(Items.length-1)){
        i++;
        ZohoBookModel.getItemIds(Items,reqZohoItems,i,zohoitems,result);
      }else{
        result(zohoitems);
      }
    }else{
      var zohoItem=reqZohoItems[i];
      var Item_update_url=constant.zoho_base_api+"items/"+zohoItem.item_id+"?organization_id="+constant.organization_id;
      console.log("Item_update_url-->",Item_update_url);
      var userdetails={JSONString:'{"name":'+item.product_name+',"rate":'+item.price+'}'}
      var formData = querystring.stringify(userdetails);
      request.put({headers: headers, url:Item_update_url, form: formData,method: 'PUT'},async function (e, r, body) {
        console.log("body-->",body);
        var Jsonvalur= JSON.parse(body);
          if(Jsonvalur.code === 57){
            ZohoBookModel.createZohoRefreshToken(function(){
              ZohoBookModel.getItemIds(Items,reqZohoItems,i,zohoitems,result);
            });
          }else{
              var itemIN={};
              itemIN.item_id=Jsonvalur.item.item_id;
              itemIN.account_id=Jsonvalur.item.account_id;
              itemIN.quantity=item.quantity;
              itemIN.tax_id="248845000000007222";
              zohoitems.push(itemIN);
            if(i!==(Items.length-1)){
              i++;
              ZohoBookModel.getItemIds(Items,reqZohoItems,i,zohoitems,result);
            }else{
              result(zohoitems);
            }
          }
      });
    }
  }else{
    var Item_update_url=constant.zoho_base_api+"items/?organization_id="+constant.organization_id;
    var userdetails={JSONString:'{"name":'+item.product_name+',"rate":'+item.price+'}'}
    var formData = querystring.stringify(userdetails);
    request.post({headers: headers, url:Contact_url, form: formData,method: 'POST'},async function (e, r, body) {
      var Jsonvalur= JSON.parse(body);
        if(Jsonvalur.code === 57){
          ZohoBookModel.createZohoRefreshToken(function(){
            ZohoBookModel.getItemIds(Items,reqZohoItems,i,zohoitems,result);
          });
        }else{
            var itemIN={};
            itemIN.item_id=Jsonvalur.item.item_id;
            itemIN.account_id=Jsonvalur.item.account_id;
            itemIN.quantity=item.quantity;
            itemIN.tax_id="248845000000007222";
            zohoitems.push(itemIN);
          if(i!==(Items.length-1)){
            i++;
            ZohoBookModel.getItemIds(Items,reqZohoItems,i,zohoitems,result);
          }else{
            result(zohoitems);
          }
        }
    });
  }
  
}
ZohoBookModel.createZohoItem =async function createZohoItem(req, result) {
   var reqItems=req.items;
   var reqZohoItems=req.zoho_items;
   var line_items=[]
   var i=0;
    ZohoBookModel.getItemIds(reqItems,reqZohoItems,i,line_items,function(res){
      req.line_items=res;
      var invoiceReq ={
        customer_id:req.customer_id,
        line_items:line_items,
        payment_terms_label:"Due on Receipt",
        payment_terms:0,
        custom_fields: [
          {
              customfield_id: "248845000000057137",
              value: req.orderid,//req.payment_type=='0'?"COD":"Online"
          }
      ]
      }
      console.log("req.userdetails.payment_type-->",req.userdetails.payment_type)
      if(req.userdetails.payment_type=='0'){
        if(req.userdetails.delivery_vendor==1) invoiceReq.reference_number="Dunzo_COD";
        else invoiceReq.reference_number="Eat_COD";
        // invoiceReq.quick_create_payment={
        //   //account_id:"248845000000000459",
        //   //payment_mode:"Cash"
        // } 
      }else{
        invoiceReq.payment_options={
          payment_gateways:[{gateway_name:"razorpay"}]
        }
      }
      ZohoBookModel.createZohoInVoice(invoiceReq,req.orderid,result);
    });
     
};
ZohoBookModel.updateShippingAddress =async function updateShippingAddress(req, result) {
  var session=sessionstorage.getItem("access_token_responce");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':'Zoho-oauthtoken '+session
   };
   //{"address":"'+req.cus_address+'","zip":"'+req.cus_pincode+'",city":"chennai","state":"TN","country":"India"},
   var address={
    address:req.userdetails.cus_address,
    zip:req.userdetails.cus_pincode,
    city:"chennai",
    state:"TN",
    country:"India"
   }
   var myJSON = JSON.stringify(address);
   var userdetails={JSONString:myJSON}
   //req.customer_id=customer_id;
       // req.address_id=address_id;
  //var userdetails={JSONString:'{"customer_id":"'+req.customer_id+'","line_items":"'+req.line_items+'"}'}
  var formData = querystring.stringify(userdetails);
  var Contact_url=constant.zoho_base_api+"contacts/"+req.customer_id+"/address/"+req.address_id+"?organization_id="+constant.organization_id;
  console.log("userdetails-->",Contact_url);
  request.put({headers: headers, url:Contact_url, form: formData,method: 'PUT'},async function (e, r, body) {
    console.log("body-->",body);
    var Jsonvalur= JSON.parse(body);
      if(Jsonvalur.code === 57){
        ZohoBookModel.createZohoRefreshToken(function(){
          ZohoBookModel.updateShippingAddress(req, result);
        });
      }else{
        console.log("Jsonvalur-->",Jsonvalur);
        ZohoBookModel.zohoGetItemList(req,result);
      }
  });
};

ZohoBookModel.createZohoInVoice =async function createZohoInVoice(req,orderid,result) {
  var session=sessionstorage.getItem("access_token_responce");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization':'Zoho-oauthtoken '+session
   };
   var myJSON = JSON.stringify(req);
   var userdetails={JSONString:myJSON}
   //+"&is_quick_create=true"
  //var userdetails={JSONString:'{"customer_id":"'+req.customer_id+'","line_items":"'+req.line_items+'"}'}
  var formData = querystring.stringify(userdetails);
  var Contact_url=constant.zoho_base_api+"invoices?organization_id="+constant.organization_id;
  console.log("userdetails-->",userdetails);
  request.post({headers: headers, url:Contact_url, form: formData,method: 'POST'},async function (e, r, body) {
    console.log("body-->",body);
    var Jsonvalur= JSON.parse(body);
      if(Jsonvalur.code === 57){
        ZohoBookModel.createZohoRefreshToken(function(){
          ZohoBookModel.createZohoInVoice(req, orderid,result);
        });
      }else{
        if(Jsonvalur.code === 0&&Jsonvalur.invoice&&Jsonvalur.invoice.invoice_id){
          var updatedetails = await query("update Orders set zoho_book_invoice_id= '"+Jsonvalur.invoice.invoice_id+"' where orderid = "+orderid+ " ")
        }
        let resobj = {
          success: true,
          status: true,
          Jsonvalur:Jsonvalur,
          result : req,
        };
         if(result) result(null, resobj);
        
      }
  });
};
ZohoBookModel.updateZohoInVoice =async function updateZohoInVoice(Items,i,result) {
  console.log("i... ",i);
  if(i<Items.length){
    var item=Items[i];
    var req={
      orderid:item.orderid,
      settlement_utr:item.settlement_utr,
    }
    ZohoBookModel.updateZohoInVoiceEach(req,function(e,res){
      if(res.success){
        i++;
        ZohoBookModel.updateZohoInVoice(Items,i,result);
      }
    })
  }else{
    let resobj = {
      success: true,
      status: true,
    };
    if(result) result(null, resobj);
  }
}

ZohoBookModel.updateZohoInVoiceEach =async function updateZohoInVoiceEach(req,result) {
  var getZohoDetail = await query("select zoho_book_invoice_id from Orders ors where ors.orderid="+req.orderid);
  console.log("orderid ",req.orderid);
  var invoice_id=getZohoDetail[0].zoho_book_invoice_id;
  
  if(invoice_id){
    console.log("invoice_id-->in ",invoice_id);
    var session=sessionstorage.getItem("access_token_responce");
    var headers= {
      'Content-Type': 'application/json',
      'Authorization':'Zoho-oauthtoken '+session
     };
     //var myJSON = JSON.stringify(req);
     //var userdetails={JSONString:myJSON}
    var userdetails={JSONString:'{"reference_number":"'+req.settlement_utr+'"}'}
    var formData = querystring.stringify(userdetails);
    var Contact_url=constant.zoho_base_api+"invoices/"+invoice_id+"?organization_id="+constant.organization_id;
    request.put({headers: headers, url:Contact_url, form: formData,method: 'PUT'},async function (e, r, body) {
      var Jsonvalur= JSON.parse(body);
        if(Jsonvalur.code === 57){
          ZohoBookModel.createZohoRefreshToken(function(){
            ZohoBookModel.updateZohoInVoiceEach(req,result);
          });
        }else{
          let resobj = {
            success: true,
            status: true,
          };
          if(result) result(null, resobj);
        }
    });
  }else{
    console.log("invoice_id--> not in ",invoice_id);
    let resobj = {
      success: true,
      status: false,
    };
     if(result) result(null, resobj);
  }
  
};

module.exports = ZohoBookModel;
