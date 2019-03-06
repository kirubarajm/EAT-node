'user strict';
var sql = require('../db.js');

var AWS_ACCESS_KEY='AKIAJJQUEYLIU23E63OA';
var AWS_SECRET_ACCESS_KEY='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';

//Task object constructor
var Documents = function(documents){
    this.moveit_userid = documents.documentsname;
    this.driver_lic=documents.lat_range;
    this.long_range=documents.long_range;
    this.created_at = new Date();
};

//https://s3.ap-south-1.amazonaws.com/eattovo/uploads/insurance/MakeIt+Wireframe_flow.pdf

Documents.createDocument = function createDocument(newDocument, result) {    

   console.log(newDocument.files.lic.name); // the uploaded file object
    
    if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send('No files were uploaded.');
    }

    //console.log(newDocument.body.f);

    let licFile = newDocument.files.lic;
    var appRoot = process.env.PWD;//"https://s3.ap-south-1.amazonaws.com/eattovo";
    console.log(appRoot);
    /*var uploadPath = appRoot + '/uploads/' + newDocument.files.lic.name;

     
    licFile.mv(uploadPath, function(err) {    
        if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                result(null, result);
          
            }
    });*/
    

    const fs = require('fs');
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
    });


    if(newDocument.files.lic)
    {

      const fileName = newDocument.files.lic.name;
      console.log(fileName);
      fs.readFile(newDocument.files.lic.path, (err, data) => {
             if (err) throw err; 
            console.log(data);
         const params = {
             Bucket: 'eattovo', // pass your bucket name
             Key: fileName, // file will be saved as testBucket/contacts.csv
             Body: newDocument.files.lic
         };
         s3.upload(params, function(s3Err, data) {
             if(s3Err) {
                        console.log("error: ", s3Err);
                        result(s3Err, null);
                    }
                    else{
                        result(null, result);
                  
                    }
             console.log(`File uploaded successfully at ${data.Location}`)
         });
      });
    }
    else
    console.log("non lic");

      /*  sql.query("INSERT INTO Documents set ?", newUser, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    result(null, res.insertId);
                }
            });    */       
};

Documents.getDocumentById = function getDocumentById(id, result) {
        sql.query("Select * from Document where documentsid = ? ", id, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};
Documents.getAllDocument = function getAllDocument(result) {
        sql.query("Select * from Documents", function (err, res) {

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

Documents.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(result) {
        sql.query("Select * from SalesTraining", function (err, res) {

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


Documents.updateById = function(id, documents, result){
  sql.query("UPDATE MoveitUser SET Documents = ? WHERE docid = ?", [documents.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};
Documents.remove = function(id, result){
     sql.query("DELETE FROM Documents WHERE docid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

module.exports=Documents;