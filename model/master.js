'user strict';


var registrationStatus = [{
    "registrationStatusid":0,"registrationStatus":"Registration",
    "registrationStatusid":1,"registrationStatus":"Makeit Appoinment",
    "registrationStatusid":2,"registrationStatus":"SalesA ssign",
    "registrationStatusid":3,"registrationStatus":"Admin Approval",
}];


var foodcycle = [{
    "foodcycleStatusid":1,"foodcycle":"breakfast",
    "foodcycleStatusid":1,"foodcycle":"breakfast",
    "foodcycleStatusid":1,"foodcycle":"breakfast",
}];

var salesfollowupstatus = [{
    "followupstatussid":0,"followupstatus":"incomplete",
    "followupstatussid":1,"followupstatus":"complete"
}];

var OrderStatus = [{
    "OrderStatusid":0,"OrderStatus":"orderput",
    "OrderStatusid":1,"OrderStatus":"orderAccept",
    "OrderStatusid":2,"OrderStatus":"orderPrepare",
    "OrderStatusid":3,"OrderStatus":"orderPacked",
    "OrderStatusid":4,"OrderStatus":"orderDelivered"
}];

var paymenttype = [{
    "paymenttypeid":0,"paymenttype":"cashOnDelivery",
    "paymenttypeid":1,"paymenttype":"netBanking"  
}];


var paymentstatus = [{
    "paymentstatusid":0,"paymentstatus":"not paid",
    "paymentstatusid":1,"paymentstatus":"paid",

}];


var ordertype = [{
    "ordertypeid":0,"ordertype":"eatuser",
    "ordertypeid":1,"ordertype":"virtual",
}];

var liveproductstatus = [{
    "active_statusid":0,"active_status":"removelivepeoduct",
    "active_statusid":1,"active_status":"movelivepeoduct"
}];


var vegtype = [{
    "vegtypeid":0,"vegtype":"veg",
    "vegtypeid":1,"vegtype":"non-veg"
}];

var usertype = [{
    "usertypeid":0,"usertype":"user",
    "usertypeid":1,"usertype":"virtual_user",
}];


var documenttype = [{
    "documenttypeid":0,"documenttype":"Kitchen image",
    "documenttypeid":1,"documenttype":"Kitchen Appliances",
    "documenttypeid":2,"documenttype":"Packaging image",
    "documenttypeid":3,"documenttype":"Signature image"
}]


var moveonlinestatus = [{
    "moveonlinestatusid":0,"moveonlinestatus":"offline",
    "moveonlinestatusid":1,"moveonlinestatus":"online",
}]

module.exports = connection;