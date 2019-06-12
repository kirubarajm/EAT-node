"user strict";
var sql = require("../db.js");
var path = require("path");
var url = require("url");
var https = require("https");
var AWS_ACCESS_KEY = "AKIAJJQUEYLIU23E63OA";
var AWS_SECRET_ACCESS_KEY = "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";
const fs = require("fs");
const AWS = require("aws-sdk");

const util = require("util");
const query = util.promisify(sql.query).bind(sql);

// AWS.config.update({
//   httpOptions: {
//     agent: proxy('http://52.219.62.68')
//   }
// });

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: "us-east-1"
});

//  var s3 = new AWS.S3({region: 'us-east-1'});
// s3.getObject({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_ACCESS_KEY}, function (err, data) {
//   console.log(err, data);
// });

//Task object constructor

var Documents = function(documents) {
  this.type = documents.type;
  this.url = documents.url;
  this.docid = documents.docid;
  this.created_at = new Date();
};

//https://s3.ap-south-1.amazonaws.com/eattovo/uploads/insurance/MakeIt+Wireframe_flow.pdf

Documents.createDocument = function createDocument(newDocument, result) {
  console.log(newDocument.files.lic.name); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  //console.log(newDocument.body.f);

  let licFile = newDocument.files.lic;
  var appRoot = process.env.PWD; //"https://s3.ap-south-1.amazonaws.com/eattovo";
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

  // const fs = require('fs');
  // const AWS = require('aws-sdk');
  // const s3 = new AWS.S3({
  // accessKeyId: AWS_ACCESS_KEY,
  // secretAccessKey: AWS_SECRET_ACCESS_KEY
  // });

  if (newDocument.files.lic) {
    const fileName = newDocument.files.lic.name;
    console.log(fileName);
    fs.readFile(newDocument.files.lic.path, (err, data) => {
      if (err) throw err;
      console.log(data);
      const params = {
        Bucket: "eattovo", // pass your bucket name
        Key: fileName, // file will be saved as testBucket/contacts.csv
        Body: newDocument.files.lic
      };
      s3.upload(params, function(s3Err, data) {
        if (s3Err) {
          console.log("error: ", s3Err);
          result(s3Err, null);
        } else {
          result(null, result);
        }
        console.log(`File uploaded successfully at ${data.Location}`);
      });
    });
  } else console.log("non lic");

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
  sql.query("Select * from Document where documentsid = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
Documents.getAllDocument = function getAllDocument(result) {
  sql.query("Select * from Documents", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("User : ", res);

      result(null, res);
    }
  });
};

Documents.getAllSalesTrainingDocument = function getAllSalesTrainingDocument(
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

Documents.updateById = function(id, documents, result) {
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

Documents.remove = function(id, result) {
  console.log();
  sql.query("DELETE FROM Documents WHERE docid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Documents.newdocumentupload = function newdocumentupload(newDocument, result) {
  //console.log(newDocument.files.lic); // the uploaded file object

  if (
    !newDocument.files ||
    !newDocument.files.lic ||
    Object.keys(newDocument.files).length == 0
  ) {
    result(
      { success: true, status: false, message: "No files were uploaded." },
      null
    );
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;

  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/sales/makeit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let message = "Document uploaded successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.createnewDocumentlist = function createnewDocumentlist(
  documentlist,
  res
) {
  sql.query("INSERT INTO Documents set ?", documentlist, function(err, result) {
    if (err) {
      console.log("error: ", err);
      res(null, err);
    }
  });
};

Documents.addNewkitchan = function addNewkitchan(documentlist) {
  return sql.query("INSERT INTO Documents set ?", documentlist);
};

Documents.updateNewkitchan = function updateNewkitchan(document, res) {
  sql.query(
    "UPDATE Documents set url = '" +
      document.url +
      "' where did='" +
      document.did +
      "'",
    function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, false);
      } else res(null, true);
    }
  );
};

Documents.createnewinfoDocument = async function createnewinfoDocument(
  documentlist,
  result
) {
  var Documentscount = await query(
    "Select * From Documents where docid = '" +
      documentlist.docid +
      "' and type = '" +
      documentlist.type +
      "'"
  );

  console.log(
    Documentscount.length +
      "--doc-id--" +
      documentlist.docid +
      "--doc-type--" +
      documentlist.type
  );
  if (Documentscount.length === 0) {
    var newDocumentsinsert = await query(
      "INSERT INTO Documents set ?",
      documentlist
    );
  } else {
    var newDocumentsinsert = await query(
      "Update Documents set url = '" +
        documentlist.url +
        "' where docid = '" +
        documentlist.docid +
        "' and type = '" +
        documentlist.type +
        "'"
    );
  }

  let sucobj = "true";
  let message = "Document saved successfully";
  let resobj = {
    success: sucobj,
    message: message
  };
  result(null, resobj);
};

Documents.createkitchenImageUpload = async function createkitchenImageUpload(
  kitchanImageList, docid,type,
) {
    var limit =5;
    var kitchenImages = await query("Select * From Documents where docid = '" +docid +"' and type = '"+type+"'");
    var balance =limit-kitchenImages.length;
    console.log("kitchenImages length: ", kitchanImageList.length);
    console.log("kitchenImages balance: ", balance);

    if(kitchanImageList.length>balance) {
      console.log("kitchenImages balance: ", balance);
      return false;
    }else {
      for (var i = 0; i < kitchanImageList.length; i++) {
        var document = new Documents(kitchanImageList[i]);
        document.docid = docid;
        await Documents.addNewkitchan(document);
      }
      console.log("kitchenImages true: ", balance);
      return true;
    }
  
};

Documents.deletekitchenImage = async function deletekitchenImage(
  documentdeletelist,
  result
) {
  if (documentdeletelist && documentdeletelist.length > 0) {
    var deletedIds = JSON.stringify(documentdeletelist);
    var deleteQuery = "DELETE From Documents where did IN (" + deletedIds + ")";
    console.log("Kitachen deleteQuery: ", deleteQuery);
    var kitchenImagedelete = await query(deleteQuery);
    result(null, kitchenImagedelete);
  }
};

Documents.remove_document = function(req, result) {
  const fs = require("fs");
  const AWS = require("aws-sdk");
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  });

  var dname = req.dname;

  //var name = Date.now() + '-' + name

  const params = {
    Bucket: "eattovo", // pass your bucket name
    Key: dname // file will be saved as testBucket/contacts.csv
  };

  console.log(params);

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let message = "Document deleted successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.newmoveitdocumentupload = function newmoveitdocumentupload(
  newDocument,
  result
) {
  //console.log(newDocument.files.lic); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;

  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/admin/moveit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //console.log(res.insertId);
      let sucobj = "true";
      let message = "Document uploaded successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.newsalesdocumentupload = function newsalesdocumentupload(
  newDocument,
  result
) {
  //console.log(newDocument.files.lic); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;

  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/admin/sales", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //console.log(res.insertId);
      let sucobj = "true";
      let message = "Document uploaded successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.newmakeitdocumentupload = function newmakeitdocumentupload(
  newDocument,
  result
) {
  //console.log(newDocument.files.lic); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;

  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/admin/makeit", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };
  console.log("params: ", params.Bucket);
  s3.upload(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //console.log(res.insertId);
      let sucobj = "true";
      let message = "Document uploaded successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

Documents.makeit_product_upload_a_document = function makeit_product_upload_a_document(
  newDocument,
  result
) {
  //console.log(newDocument.files.lic); // the uploaded file object

  if (Object.keys(newDocument.files).length == 0) {
    return result.status(400).send("No files were uploaded.");
  }

  var fileName = newDocument.files.lic;
  var name = fileName.name;

  var name = Date.now() + "-" + name;

  const params = {
    Bucket: "eattovo/upload/admin/makeit/product", // pass your bucket name
    Key: name, // file will be saved as testBucket/contacts.csv
    Body: fileName.data,
    ContentType: "image/jpg",
    ACL: "public-read"
  };
  console.log("params: ", params.Bucket);
  s3.upload(params, (err, data) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //console.log(res.insertId);
      let sucobj = "true";
      let message = "Document uploaded successfully";
      let resobj = {
        success: sucobj,
        message: message,
        data: data
      };
      result(null, resobj);
    }
  });
};

module.exports = Documents;
