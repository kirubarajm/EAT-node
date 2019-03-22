'user strict';
var sql = require('../db.js');

//Task object constructor
var Documentmoveit = function (documentmoveit) {
    this.moveit_userid = documentmoveit.moveit_userid;
    this.driver_lic = documentmoveit.driver_lic;
    this.vech_insurance = documentmoveit.vech_insurance;
    this.vech_rcbook = documentmoveit.vech_rcbook;
    this.photo = documentmoveit.photo;
    this.legal_document = documentmoveit.legal_document;
    this.created_at = new Date();
};



Documentmoveit.createnewDocument = function createnewDocument(newdocument, res) {

  
    sql.query("INSERT INTO Documents_Moveit set ?", newdocument, function (err, res1) {

        if (err) {
            console.log("error: ", err);
            res(null, err);
        }else{
   
              let sucobj=true;
              let mesobj = "Moveit document stored successfully";
              let resobj = {  
                success: sucobj,
                message:mesobj
                }; 
          res(null, resobj);
               }
    });
   
   };



Documentmoveit.getDocumentById = function getDocumentById(id, result) {
    sql.query("Select * from Documents_Moveit where documentsid = ? ", id, function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                result(null, res);
          
            }
        });   
};
Documentmoveit.getAllDocument = function getAllDocument(result) {
    sql.query("Select * from Documents_Moveit", function (err, res) {

            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              console.log('User : ', res);  

             result(null, res);
            }
        });   
};

Documentmoveit.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(result) {
    sql.query("Select * from Documents_Moveit", function (err, res) {

            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              console.log('User : ', res);  

                let sucobj='true';
                let resobj = {  
                success: sucobj,
                result: res 
                };
                result(null, resobj);
            }
        });   
};

//create_a_sales_training_documents


Documentmoveit.updateById = function(id, documents, result){
sql.query("UPDATE Documents_Moveit SET Documents = ? WHERE docid = ?", [documents.task, id], function (err, res) {
      if(err) {
          console.log("error: ", err);
            result(null, err);
         }
       else{   
         result(null, res);
            }
        }); 
};

Documentmoveit.remove = function(req, result){

    console.log(req);
 sql.query("DELETE FROM Documents_Moveit WHERE docid = ?", [req.did], function (err, res) {

            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
           
             result(null, res);
            }
        }); 
};


// Documentsales.remove_s3_sales_doc = function(dname, result){
//     const fs = require('fs');
//      const AWS = require('aws-sdk');
//      const s3 = new AWS.S3({
//      accessKeyId: AWS_ACCESS_KEY,
//      secretAccessKey: AWS_SECRET_ACCESS_KEY
//      });
    
     
//           const params = {
//               Bucket: 'eattovo/upload/sales/makeit', // pass your bucket name
//               Key: dname // file will be saved as testBucket/contacts.csv
//           };
      
//           s3.deleteObjects(params, (err, data) => {
//             if(err) {   
//                 console.log("error: ", err);
//                 result(err, null);
//             }
//             else{
//                 //console.log(res.insertId);                    
//                 let sucobj='true';
//                 let message = 'Doucment Deleted successfully';
//                 let resobj = {  
//                 success: sucobj,
//                 message:message,
//                 data:data
//                 };
//                 result(null, resobj);
//             }
//         })
//    };





Documentmoveit.getsalesDocumentById = function getsalesDocumentById(req, result) {
   
    sql.query("Select * from Documents_Sales as dcs left join Documents as dc on dcs.docid=dc.docid where dcs.sales_userid = ?  and dcs.makeit_userid = ?", [req.sales_userid,req.makeit_userid], function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                result(null, res);
          
            }
        });   
};

module.exports= Documentmoveit;