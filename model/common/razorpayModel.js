"user strict";
var sql = require("../db.js");
const util = require("util");
const Rpay = require("razorpay");
var moment = require("moment");
var request = require('request');
var constant = require("../constant.js");
const razorpaySettlement= require("./razorpaySettlementModel")
const ZohoBookModel= require("./ZohoBookModel")
// var instance = new Rpay({
//     key_id: "rzp_test_3cduMl5T89iR9G",
//     key_secret: "BSdpKV1M07sH9cucL5uzVnol"
//   });

// var instance = new Rpay({
//   key_id: 'rzp_live_BLJVf00DRLWexs',
//   key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
// })

var instance = new Rpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})
  const query = util.promisify(sql.query).bind(sql);


  var Razorpay = function(razorpay) {
    this.orderid = refund.orderid;
    this.original_amt = refund.original_amt;
    this.refund_amt = refund.refund_amt ;
    this.active_status = refund.active_status;
    this.userid =refund.userid;
    this.payment_id =refund.payment_id;
  };
  
// customer id generation

Razorpay.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userinfo) {
    var name = userinfo[0].name;
    var email = userinfo[0].email;
    var contact = userinfo[0].phoneno;
    var notes = "eatuser";
    var cuId = false;
  
    return await instance.customers
      .create({ name, email, contact, notes })
      .then(data => {
        cuId = data.id;
        //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
  
        sql.query(
          "UPDATE User SET razer_customerid ='" +
            data.id +
            "'  where userid = " +
            userinfo[0].userid +
            " ",
          function(err, customerupdate) {
            if (err) {
              console.log("error: ", err);
              //  return false;
            }
          }
        );
        console.log("cuId:----- ", cuId);
        return cuId;
      })
      .catch(error => {
        console.log("error: ", error);
        return false;
      });
  };

  // Partial refund for a payment
  Razorpay.razorpay_refund_payment_by_paymentid = async function razorpay_refund_payment_by_paymentid(req,result) {
    
    const onlinerefunddetails = await query("select * from Refund_Online where  rs_id ="+req.rs_id+"");
    const servicecharge = constant.servicecharge;
    
    if (onlinerefunddetails[0].active_status === 1 ) {
      
    //  if (req.amount > servicecharge) {
         
      ///cancel by ===1 is eat user cancel amount detect
    // if (req.cancel_by && req.cancel_by === 1) {
    //     amount= req.amount - servicecharge;
    // }else{
    //     amount= req.amount;
    // }
    // instance.payments. refund(req.paymentid, {
    // amount: 10,
    var amount= req.amount;
    var refund_amt = req.amount
    instance.payments.refund(req.paymentid, {
      //amount values convert to paisa
    amount: amount * 100,
    notes: {
      note1: 'Refund amount'
    }
  }).then((data) => {
    console.log(data);
    // success
    var refunded_by=req.refunded_by ||0;
    updatequery = "update Refund_Online set active_status= 0,refund_amt = '"+refund_amt+"',payment_id='"+data.id+"',refunded_by = '"+refunded_by+"',cancellation_charges='"+servicecharge+"' where rs_id ='" + req.rs_id + "'"
    
    sql.query(updatequery, async function (err, res) {
        if(err) {
            console.log("error: ", err);
            result(err, null);
           }
         else{  
              var orderactionlog={};
              orderactionlog.orderid=res.orderid || 0;
              orderactionlog.app_type=req.app_type || 0;
              orderactionlog.userid=req.admin_id || 0;
              orderactionlog.action=12;
              await Order.createOrderActionLog(orderactionlog);

              var  message = "Amount refunded successfully"
              let sucobj=true;
              let resobj = {  
                success: sucobj,
                status:true,
                message:message,
                result:data,
                }; 
             result(null, resobj);
              }
    }); 

  }).catch((error) => {
    console.log("error: ", error);
    let resobj = {
        success: true,
        status: false,
        message:error.error.description//"Sorry! Payment not captured."
    };
    result(null,resobj);
    // error
  })

// }else{

 
//   let resobj = {  
//     success: true,
//     status:false,
//     message:"Sorry insufficient amount!",
//     result:onlinerefunddetails,
//     }; 

//  result(null, resobj);
// }
    }else if (onlinerefunddetails[0].active_status===0) {
    
    var  message = "Sorry your refund amount has been already refunded!"
          
              let sucobj=true;
              let resobj = {  
                success: sucobj,
                status:false,
                message:message,
                result:onlinerefunddetails,
                }; 
  
             result(null, resobj);
  }
};


//Razorpay Capture Fuction  /**Praveen*/
Razorpay.razorpaycapture = async function razorpaycapture(req, result) {
  /* 
  var payment_id = "pay_DRvQzTw3y9Xeuq";
  var amount   = parseInt(1 * 100);
  instance.payments.capture(payment_id, parseInt(amount))
  */
  var data = JSON.stringify(req);
  console.log(JSON.stringify(req.orderlist[0]));
  console.log(data);
  var insertquery= "insert into Orders_webhook JSONDoc(cancel_reason) values("+JSON.stringify(req.orderlist[0])+")";
  console.log(insertquery);
  const insertwebhooks = await query(insertquery);
  //console.log(insertwebhooks);
  result(null, insertwebhooks);
  /*var orderid = 433;
 const getprice = await query("select price from Orders where orderid ='" +orderid+"'");
 console.log(getprice[0].price);
 */

};
function toDateTime(secs) {
  var t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}

//Razorpay settlement Fuction  /**Praveen*/
Razorpay.razorpaysettlement  = async function razorpaysettlement(req, result) {
  // instance.payments
  // .all({
  //   from: '2020-03-01',
  //   to: '2020-03-01',
  // })
  // .then(response => {
  //   // handle success
  //   console.log("response-->",response);
  //   result(null, response);
  // })
  // .catch(error => {
  //   // handle error
  //   console.log("error-->",error);
  // });
  var auth = "Basic " + Buffer.from(constant.razorpay_key_id + ":" + constant.razorpay_key_secret).toString("base64");
        var headers= {
          'Content-Type': 'application/json',
          'Authorization': auth,
         };
  var settlement_url="https://api.razorpay.com/v1/settlements/recon/combined?year="+req.year+"&month="+req.month+"&day="+req.day
  request.get({headers: headers, url:settlement_url,method: 'GET'},async function (e, r, body) {
    
    var Jsonvalur= JSON.parse(body);
    if(Jsonvalur.count !== 0){
      var items=Jsonvalur.items;
      for(var i=0; i<items.length;i++){
        //var insertquery= "Select orderid from Orders where transactionid='"+items[i].payment_id+"'";
        //console.log(insertquery);
        //const insertwebhooks = await query(insertquery);
        //
        //items[i].orderid=insertwebhooks[0].orderid;
        var ctimestamp = moment.unix(items[i].created_at);
        items[i].created_at= ctimestamp.format("YYYY-MM-DD HH:mm:ss");//moment().format("YYYY-MM-DD HH:mm:ss");

        var stimestamp = moment.unix(items[i].settled_at);
        items[i].settled_at= stimestamp.format("YYYY-MM-DD HH:mm:ss");

        if(items[i].description){
        var  orderid = items[i].description.replace( /[^\d.]/g, '' ); 
        items[i].orderid=orderid;
        }else if(items[i].notes){
          var note= JSON.parse(items[i].notes);
          var  orderid = 0; 
          if(note.note1) orderid= note.note1.replace( /[^\d.]/g, '' ); 
          items[i].orderid=orderid;
          }
      }
      await razorpaySettlement.createRazorpaySettlementBulk(items);
      if(result) result(null, items);
      ZohoBookModel.updateZohoInVoice(items,0);
      //console.log("items-->",items);
    }
});

};

module.exports = Razorpay;