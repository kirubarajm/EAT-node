'user strict';

// makeit appointment status 
var registrationStatus = [{
    "registrationStatusid":0,"registrationStatus":"Registration",
    "registrationStatusid":1,"registrationStatus":"Makeit Appoinment",
    "registrationStatusid":2,"registrationStatus":"SalesA ssign",
    "registrationStatusid":3,"registrationStatus":"Admin Approval",
}];


// Food Cycle for product 0 is disable 1 is enable for food cycle
var foodcycle = [{
    "foodcycleStatusid":1,"foodcycle":"Breakfast",
    "foodcycleStatusid":1,"foodcycle":"Lunch",
    "foodcycleStatusid":1,"foodcycle":"Dinner",
}];


// Sales for followupstatus
var salesfollowupstatus = [{
    "followupstatussid":0,"followupstatus":"incomplete",
    "followupstatussid":1,"followupstatus":"complete"
}];


// order status
var OrderStatus = [{
    "OrderStatusid":0,"OrderStatus":"orderput",
    "OrderStatusid":1,"OrderStatus":"orderAccept",
    "OrderStatusid":2,"OrderStatus":"orderPrepare",
    "OrderStatusid":3,"OrderStatus":"orderPacked",
    "OrderStatusid":4,"OrderStatus":"kitchen reached",
    "OrderStatusid":5,"OrderStatus":"orderPickedup",
    "OrderStatusid":6,"OrderStatus":"orderDelivered"
}];

//order payment type
var paymenttype = [{
    "paymenttypeid":0,"paymenttype":"cashOnDelivery",
    "paymenttypeid":1,"paymenttype":"netBanking"  
}];

//order payment status
var paymentstatus = [{
    "paymentstatusid":0,"paymentstatus":"not paid",
    "paymentstatusid":1,"paymentstatus":"paid",

}];

//order user type
var ordertype = [{
    "ordertypeid":0,"ordertype":"eatuser",
    "ordertypeid":1,"ordertype":"virtual",
}];

//product move to live
var liveproductstatus = [{
    "active_statusid":0,"active_status":"removelivepeoduct",
    "active_statusid":1,"active_status":"movelivepeoduct"
}];

// food type
var foodtype = [{
    "vegtypeid":0,"vegtype":"veg",
    "vegtypeid":1,"vegtype":"non-veg"
}];

// user type
var usertype = [{
    "usertypeid":0,"usertype":"user",
    "usertypeid":1,"usertype":"virtual_user",
}];

// image upload type 
var documenttype = [{
    "documenttypeid":0,"documenttype":"Kitchen image",
    "documenttypeid":1,"documenttype":"Kitchen Appliances",
    "documenttypeid":2,"documenttype":"Packaging image",
    "documenttypeid":3,"documenttype":"Signature image"
}]

// sales move online 
var moveonlinestatus = [{
    "moveonlinestatusid":0,"moveonlinestatus":"offline",
    "moveonlinestatusid":1,"moveonlinestatus":"online",
}]

// order payment status
var paymentstatus = [{
    "paymentstatusid":0,"paymentstatus":"Pending",
    "paymentstatusid":1,"paymentstatus":"Paid",
    "paymentstatusid":2,"paymentstatus":"Cancelled",
    "paymentstatusid":3,"paymentstatus":"Refunded",
    "paymentstatusid":4,"paymentstatus":"Declined",
    "paymentstatusid":5,"paymentstatus":"onliIncompletene",

}]

// order pick up quality check
var qualitycheck = [{
    "id":1,"description" :'Hot Food Received',
    "id":2,"description" :'Food Packaging',
    "id":3,"description" :'Food Preparation Time',
    "id":4,"description" :'product'
}]

// order pick up quality check
var qualitycheckenabletype = [{
    "id":0,"description" :'not ok',
    "id":1,"description" :'ok'
}]

module.exports = connection;