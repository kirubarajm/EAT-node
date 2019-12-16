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
    req.makeit_id+" order by pi.created_at desc";
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

PackageInvetory.getPackageInventoryByid = function getPackageInventoryByid(
  req,
  result
) {
  var packageQuery =
    "select * from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid where pi.id="+req.inventoryid;
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

PackageInvetory.getPackageInventoryStockList = function getPackageInventoryStockList(
  req,
  result
) {
  // SELECT mk.userid,mk.name,mk.phoneno,mk.brandname,it.packageid,it.remaining_count,pb.name FROM MakeitUser mk right join InventoryTracking it on it.makeit_id=mk.userid left join PackagingBox pb on it.packageid =pb.id where it.id in (SELECT max(id) FROM InventoryTracking where makeit_id=mk.userid GROUP BY packageid) and  it.packageid=1
  var packageStockQuery ="SELECT mk.userid,mk.phoneno,mk.brandname,it.packageid,it.remaining_count,pb.name FROM MakeitUser mk right join InventoryTracking it on it.makeit_id=mk.userid left join PackagingBox pb on it.packageid =pb.id where it.id in (SELECT max(id) FROM InventoryTracking where makeit_id=mk.userid GROUP BY packageid)"

  if(req.search){
    packageStockQuery=packageStockQuery+" and (mk.brandname like '%"+req.search+"%' or mk.userid LIKE  '%" + req.search +"%' or pb.name LIKE  '%" + req.search +"%')" 
  }

  if(req.isAlert){
    packageStockQuery=packageStockQuery+" and it.remaining_count<=25"
  }

  
  sql.query(packageStockQuery, function(err, res) {
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

PackageInvetory.getAllPackageInventoryList = function getAllPackageInventoryList(
  req,
  result
) {

  var packageInventoryQuery ="select pi.id,mk.userid,mk.name,mk.phoneno,mk.brandname,pi.packageid,pi.created_at,pi.count,pb.name as pname from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid join MakeitUser mk on mk.userid=pi.makeit_id"

  if(req.search){
    packageInventoryQuery=packageInventoryQuery+" and (mk.brandname like '%"+req.search+"%' or mk.userid LIKE  '%" + req.search +"%' or pb.name LIKE  '%" + req.search +"%')" 
  }

  packageInventoryQuery =packageInventoryQuery+" order by pi.created_at desc";

  sql.query(packageInventoryQuery, function(err, res) {
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
