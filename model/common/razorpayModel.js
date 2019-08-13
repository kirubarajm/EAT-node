"user strict";
var sql = require("../db.js");
const util = require("util");
const Rpay = require("razorpay");
var constant = require("../constant.js");

// var instance = new Rpay({
//     key_id: "rzp_test_3cduMl5T89iR9G",
//     key_secret: "BSdpKV1M07sH9cucL5uzVnol"
//   });

var instance = new Rpay({
  key_id: 'rzp_live_BLJVf00DRLWexs',
  key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
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
      
      if (req.amount > servicecharge) {
         
      ///cancel by ===1 is eat user cancel amount detect
    if (req.cancel_by && req.cancel_by === 1) {
        amount= req.amount - servicecharge;
    }else{
        amount= req.amount;
    }
    // instance.payments. refund(req.paymentid, {
    // amount: 10,
    var refund_amt = amount
    instance.payments.refund(req.paymentid, {
      //amount values convert to paisa
    amount: amount * 100,
    notes: {
      note1: 'Refund amount'
    }
  }).then((data) => {
    console.log(data);
    // success
    updatequery = "update Refund_Online set active_status= 0,refund_amt = '"+refund_amt+"',payment_id='"+data.id+"',cancellation_charges='"+servicecharge+"' where rs_id ='" + req.rs_id + "'"
    
    sql.query(updatequery, function (err, res) {
        if(err) {
            console.log("error: ", err);
              result(err, null);
           }
         else{   
         
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
    console.error('error-->',error)
    let resobj = {
        success: true,
        status: false,
        message:error.description//"Sorry! Payment not captured."
        //result: error
    };
    result(resobj,null);
    // error
  })

}else{

 
  let resobj = {  
    success: true,
    status:false,
    message:"Sorry insufficient amount!",
    result:onlinerefunddetails,
    }; 

 result(null, resobj);
}
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

  module.exports = Razorpay;