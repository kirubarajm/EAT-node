"user strict";
var sql = require("../db.js");

var PackagingBox = function(packagingbox) {
    this.boxtype = packagingbox.boxtype;
    this.sales_userid = packagingbox.sales_userid;
    this.makeit_userid = packagingbox.makeit_userid;
    this.count  = packagingbox.count;
    this.aid  = packagingbox.aid;
    //this.created_at = new Date();
  };
  

  PackagingBox.createnewPackagingBox = function createnewPackagingBox(packagingboxdetails,res) {
      console.log(packagingboxdetails);
    sql.query("INSERT INTO Packaging_Boxs set ?", packagingboxdetails, function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, err);
      }
    });
  };
  

// PackagingBox.createnewPackagingBox= async function createnewPackagingBox( packagingboxdetails, result) {

//     var Boxdetailscount = await query("Select * From Packaging_Boxs where boxtype = '" +packagingboxdetails.boxtype+"' and sales_userid = '" +packagingboxdetails.sales_userid+"' and makeit_userid = '" +packagingboxdetails.makeit_userid+"'");
  
//     console.log(Boxdetailscount.length);
//     if (Boxdetailscount.length === 0) {
//       var Boxdetailscountinsert = await query("INSERT INTO Packaging_Boxs set ?", packagingboxdetails);
//     }else{
  
//       var Boxdetailscountupdate = await query("Update Packaging_Boxs set boxtype = '" +packagingboxdetails.boxtype+"' and count = '" +packagingboxdetails.count+"'  where sales_userid = '" +packagingboxdetails.sales_userid+"' and makeit_userid = '" +packagingboxdetails.makeit_userid+"'");
//     }
  
//     let sucobj = "true";
//         let message = "Document saved successfully";
//         let resobj = {
//           success: sucobj,
//           message: message
//         };
//         result(null, resobj);
//   };
  
module.exports = PackagingBox;