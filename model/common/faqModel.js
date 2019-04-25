'user strict';
var sql = require('../db.js');

//Task object constructor
var Faq = function(faq){
    this.faqid = faq.faqid;
    this.question=faq.question;
    this.answer=faq.answer;
    this.type=faq.type;
    this.created_at = new Date();
};


Faq.createFaq = function createFaq(newFaq, result) {    
        sql.query("INSERT INTO Faq set ?", newFaq, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
               let sucobj=true;
               let message = "Faq created succesfully";
                let resobj = {  
                success: sucobj,
                message:message,
                faqid: res.insertId
                }; 
    
             result(null, resobj);
          
            }
                
            });           
};


Faq.getFaqById = function getFaqById(userId, result) {
        sql.query("Select * from Faq where faqid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};


Faq.getFaqByType = function getFaqById(id, result) {
        sql.query("Select * from Faq where type = ? ", id, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                     let sucobj='true';
                    let resobj = {  
                    success: sucobj,
                    result: res 
                    };
                    result(null, resobj);
              
                }
            });   
};

Faq.getAllFaq = function getAllFaq(result) {
        sql.query("Select * from Faq", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Faq : ', res);  

                  let sucobj='true';
                    let resobj = {  
                    success: sucobj,
                    result: res 
                    };
                    result(null, resobj);
                }
            });   
};

Faq.updateById = function(id, user, result){
  sql.query("UPDATE Faq SET task = ? WHERE faqid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Faq.remove = function(id, result){
     sql.query("DELETE FROM Faq WHERE faqid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

Faq.getAllFaqbyid = function getAllFaqByid(id,result) {
        sql.query("Select * from Faq where faqid = ? ", id, function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Faq : ', res);  
                 result(null, res);
                }

            });   
};

module.exports= Faq;