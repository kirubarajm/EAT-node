'user strict';
var sql = require('../db.js');
var QueryAnswer = require('../../model/common/queryanswerModel');
//Task object constructor
var QueryQuestions = function(queryquestions){
    this.question=queryquestions.question;
    this.type=queryquestions.type;
    this.userid=queryquestions.userid;
    this.admin_read=queryquestions.admin_read || 0;
    this.created_at = new Date();
};


QueryQuestions.createquestions = function createquestions(req, result) { 

        sql.query("INSERT INTO Query_questions  set ?", req, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    let sucobj=true;
                    let message = "Questions created successfully";
                    let resobj = {  
                    success: sucobj,
                    message:message
                    }; 

             result(null, resobj);
                }
            });           
};

QueryQuestions.read_a_question_id = function read_a_question_id(req, result) {
        console.log(req);
         //var count = []; 
        sql.query("Select * from Query_questions where userid = '"+req.userid+"' and type = '"+req.type+"' order by qid desc", function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{

                    for (let i = 0; i < res.length; i++) {
                        
                        sql.query("Select COUNT(*) as count from Query_answers where userid = '"+res[i].userid+"' and user_read = 0 and qid = '"+res[i].qid+"' group by user_read", function (err, res1) {             
                            if(err) {
                                console.log("error: ", err);
                                result(err, null);
                            }
                            else{
                                
                                res[i].count = res1[0];
                             
    
                                
                            }
                        }); 
                         
                    }

                       
                    let sucobj=true;
                    let resobj = {
                        sucobj:sucobj,  
                        result:res
                         }; 
             result(null, resobj);
                }
            });   
};


QueryQuestions.getFaqByType = function getFaqById(id, result) {
        sql.query("Select * from Query_questions where type = ? ", id, function (err, res) {             
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

QueryQuestions.getAllFaq = function getAllFaq(result) {
        sql.query("Select * from Query_questions", function (err, res) {

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

QueryQuestions.updateById = function(id, user, result){
  sql.query("UPDATE Query_questions SET task = ? WHERE faqid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

QueryQuestions.remove = function(id, result){
     sql.query("DELETE FROM Query_questions WHERE faqid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

QueryQuestions.getAllFaqbyid = function getAllFaqByid(id,result) {
        sql.query("Select * from Query_questions where faqid = ? ", id, function (err, res) {

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




module.exports= QueryQuestions;