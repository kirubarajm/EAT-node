'user strict';
var sql = require('../db.js');

//Task object constructor
var Eatfeedback = function(eatfeedback){
    this.rating = eatfeedback.rating;
    this.content= eatfeedback.content;
    this.userid = eatfeedback.userid;
    this.created_at = new Date();
};


Eatfeedback.createfeedback= function createfeedback(newfeedback, result) {    
        sql.query("INSERT INTO Eat_Feedback set ?", newfeedback, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
               let sucobj=true;
               let message = "Feedback created succesfully";
                let resobj = {  
                success: sucobj,
                message:message,
                faqid: res.insertId
                }; 
    
             result(null, resobj);
          
            }
                
            });           
};


Eatfeedback.getfeedbackById = function getfeedbackById(feedbackId, result) {
        sql.query("Select * from Faq where Eat_Feedback = ? ", feedbackId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};


Eatfeedback.getfeedbackByType = function getfeedbackById(id, result) {
        sql.query("Select * from Eat_Feedback where type = ? ", id, function (err, res) {             
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

Eatfeedback.getAllfeedback = function getAllfeedback(result) {
        sql.query("Select * from Eat_Feedback", function (err, res) {

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



module.exports= Eatfeedback;