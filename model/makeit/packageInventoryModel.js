"user strict";
var sql = require("../db.js");
var PackageInvetoryTeacking = require("../../model/makeit/packageInventoryTrackingModel.js");

//Task object constructor
var PackageInvetory = function(packageinvetory) {
  this.makeit_id = packageinvetory.makeit_id;
  this.count = packageinvetory.count || 0;
  this.packageid = packageinvetory.packageid;
};

PackageInvetory.createPackageInventory = function createPackageInventory(
  packageinvetory,
  result
) {
  console.log(packageinvetory);
  sql.query("INSERT INTO Package_Inventory set ?", packageinvetory, function(
    err,
    res
  ) {
    if (err) {
      sql.rollback(function() {
        throw err;
      });
      //res(null, err);
    }else{
      let resobj = {
        success: true,
        status:true
      };
      PackageInvetoryTeacking.CheckandUpdate(packageinvetory,function(
        err,
        res
      ) {
        if (err) {
          sql.rollback(function() {
            throw err;
          });
        }
      });

      result(null, resobj);
    }
  });
};

PackageInvetory.deletePackageinventory = function deletePackageinventory(
  makeit_id,
  package_id,
  res
) {
  sql.query(
    "DELETE FROM Package_Inventory where makeit_id = " +
      makeit_id +
      " and packageid =" +
      package_id,
    function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, err);
      }
    }
  );
};

PackageInvetory.updatePackageitems = function updatePackageitems(
  package_item,
  result
) {
  sql.query(
    " select * from ProductPackaging where product_id = " +
      package_item.product_id +
      " and package_id = " +
      package_item.package_id +
      "",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("res===>: ", res.length);
        if (res.length == 0) {
          sql.query(
            "INSERT INTO ProductPackaging set ?",
            package_item,
            function(err, result) {
              if (err) {
                console.log("error: ", err);
                res(null, err);
              } else {
                console.log("result===>: ", result);
              }
            }
          );
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true
          };

          result(null, resobj);
        } else if (res.length == 1) {
          console.log("update");
          sql.query(
            "update ProductPackaging set count = ?, updated_at= ? where product_id = ? and package_id = ?",
            [
              package_item.count,
              new Date(),
              package_item.product_id,
              package_item.package_id
            ],
            function(err, result) {
              if (err) {
                console.log("error: ", err);
                res(null, err);
              }
            }
          );
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true
          };

          result(null, resobj);
        }
      }
    }
  );
};

PackageInvetory.getPackageInventoryList = function getPackageInventoryList(
  req,
  result
) {
  var packageQuery =
    "select * from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid where pi.makeit_id = " +
    req.makeit_id;
  sql.query(packageQuery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};
module.exports = PackageInvetory;
