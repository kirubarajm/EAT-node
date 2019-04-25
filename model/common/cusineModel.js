'user strict';
var sql = require('../db.js');

//Task object constructor
var Cusine = function(cusine){
    this.regionname=cusine.cusinename;
    this.created_at = new Date();
};


Cusine.createRegion = function createRegion(req, result) { 

        sql.query("INSERT INTO Cusine  set ?", req, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    let sucobj=true;
                    let message = "Region created successfully";
                    let resobj = {  
                    success: sucobj,
                    message:message
                    }; 

             result(null, resobj);
                }
            });           
};

Cusine.read_a_question_id =  function read_a_question_id(req, result) {
     
          
        var query = "Select * from Cusine where type = '"+req.type+"'"

         if (req.type && req.userid) {    
            query = query +" and userid = '"+req.userid+"'"
         }
         query = query + "order by qid desc";

         console.log(query);
         
        sql.query(query,  function (err, res) {  
    
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{

                    for (let i = 0; i < res.length; i++) {
                             

                      //res[i].count = count;
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


Cusine.getRegionByType = function getRegionByType(id, result) {
        sql.query("Select * from Cusine where type = ? ", id, function (err, res) {             
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



Cusine.getAllcusine = function getAllcusine(result) {

        sql.query("Select cuisineid,cuisinename from Cuisine", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
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

Cusine.updateById = function(id, user, result){
  sql.query("UPDATE Cusine SET task = ? WHERE faqid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Cusine.remove = function(id, result){
     sql.query("DELETE FROM Cusine WHERE faqid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};






module.exports= Cusine;