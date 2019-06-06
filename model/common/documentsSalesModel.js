"user strict";
var sql = require("../db.js");
var Documents = require("./documentsModel.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Documentsales = function(documentsales) {
  this.remarks = documentsales.remarks;
  this.sales_userid = documentsales.sales_userid;
  this.makeit_userid = documentsales.makeit_userid;
  //this.created_at = new Date();
};

Documentsales.createnewDocument = async function createnewDocument(newdocument,new_documents_list,res) {

  var salesdocu = await query("Select * From Documents_Sales where sales_userid = '" +newdocument.sales_userid+"' and makeit_userid = '" +newdocument.makeit_userid+"'");
 
  if (salesdocu.length === 0) {
   
    var salesinsert = await query("INSERT INTO Documents_Sales set ?", newdocument);
    console.log(salesinsert.insertId);
    var docid  = salesinsert.insertId;
    console.log("insert");
  }else{
    var docid  = salesdocu[0].docid;
    console.log("get docid");
  }

 // var docid = res1.insertId;
 
 console.log(new_documents_list);
  for (var i = 0; i < new_documents_list.length; i++) {
    var documentlist = new Documents(new_documents_list[i]);
    documentlist.docid = docid;
    Documents.createnewDocumentlist(documentlist, function(err, result) {
      if (err) res.send(err);
    });
  }

  // sql.query("INSERT INTO Documents_Sales set ?", newdocument, function(err,res1) {
  //   if (err) {
  //     console.log("error: ", err);
  //     res(null, err);
  //   } else {
     

     
  //   }
  // });
  let sucobj = true;
  let mesobj = "Document stored successfully";
  let resobj = {
    success: sucobj,
    message: mesobj,
    docid: docid
  };
  res(null, resobj);
};

Documentsales.getDocumentById = function getDocumentById(id, result) {
  sql.query(
    "Select * from Documents_Sales where documentsid = ? ",
    id,
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};
Documentsales.getAllDocument = function getAllDocument(result) {
  sql.query("Select * from Documents_Sales", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("User : ", res);

      result(null, res);
    }
  });
};

Documentsales.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(
  result
) {
  sql.query("Select * from SalesTraining", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("User : ", res);

      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

//create_a_sales_training_documents

Documentsales.updateById = function(id, documents, result) {
  sql.query(
    "UPDATE MoveitUser SET Documents = ? WHERE docid = ?",
    [documents.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

Documentsales.remove = function(req, result) {
  console.log(req);
  sql.query("DELETE FROM Documents_Sales WHERE docid = ?", [req.did], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
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

Documentsales.getsalesDocumentById = function getsalesDocumentById(
  req,
  result
) {
  sql.query(
    "Select * from Documents_Sales as dcs left join Documents as dc on dcs.docid=dc.docid where dcs.sales_userid = ?  and dcs.makeit_userid = ?",
    [req.sales_userid, req.makeit_userid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

module.exports = Documentsales;
