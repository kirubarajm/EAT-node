"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var IVR = function(Ivr) {
    this.faqid = Ivr.faqid;
  this.question = Ivr.question;
  this.answer = Ivr.answer;
  this.type = Ivr.type;
};


IVR.send_ivr_call_makeit =async function send_ivr_call_makeit(orderid, result) {
  
    var phonenumber = '';
    var get_phone_number =await query("select mk.phoneno,mk.virtualkey,mh.phone_number from Orders ors join MakeitUser mk on mk.userid=ors.makeit_user_id join Makeit_hubs mh on mh.makeithub_id=mk.makeithub_id  where orderid="+orderid+" ");
    
    if (get_phone_number[0].virtualkey==0) {
        
      phonenumber= get_phone_number[0].phoneno;
      var mainurl ='http://my.exotel.com/tovotechnologies1/exoml/start_voice/281300';
      var CallerId = '044-463-11049';

      var url ="https://ad35b828ac1a5d32239cef97717d9e397045e52cc4790cd5:6f2a3a9a066ccb7d27e55922671f063df7acf0668ebb21ff@api.exotel.com/v1/Accounts/tovotechnologies1/Calls/connect?From="+phonenumber+"&Url=http://my.exotel.com/tovotechnologies1/exoml/start_voice/281300&CallerId=044-463-11049";
  

      var form = {
        From : phonenumber,
        Url: mainurl,
        CallerId:CallerId
      }
     

      var headers= {
        'Content-Type': 'application/json',
        'Accept-Language':'en_US'
      };

      request.post({headers: headers, url: url, json: form, method: 'POST'},async function (error,response, body) {
        if (error) {
            console.log("error: ", err);
            result(null, err);
          } else {
             console.log(response.statusCode, body);
             var responcecode = body.split("#");
             console.log(responcecode);
  
            
     
            }
    });


    }else{
      
      phonenumber= get_phone_number[0].phone_number;
    }
   
};



module.exports = IVR;
