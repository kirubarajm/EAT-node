"user strict";
var sql = require("../db.js");
var Productitem = require("../../model/makeit/productitemsModel.js");
var Packageitem = require("../../model/makeit/packageitemsModel.js");
var producthistory = require("../../model/makeit/liveproducthistoryModel.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var constant = require("../constant.js");


var moment    = require("moment");


//Task object constructor
var Product = function(product) {
  this.makeit_userid = product.makeit_userid;
  this.product_name = product.product_name;
  this.active_status = product.active_status || 0;
  this.vegtype = product.vegtype;
  this.image = product.image;
  this.preparetime = product.preparetime;
  this.price = product.price;
  this.breakfast = product.breakfast || 0;
  this.lunch = product.lunch || 0;
  this.dinner = product.dinner || 0;
  this.monday = product.monday || 0;
  this.tuesday = product.tuesday || 0;
  this.wednesday = product.wednesday || 0;
  this.thrusday = product.thrusday || 0;
  this.friday = product.friday || 0;
  this.saturday = product.saturday || 0;
  this.sunday = product.sunday || 0;
  this.delete_status = product.delete_status || 0;
  //  this.created_at = new Date();
  this.quantity = product.quantity || 0;
  this.cuisine = product.cuisine || 1;
  this.approved_status = product.approved_status || 1;
  this.prod_desc = product.prod_desc;
  this.product_desc_flag = product.product_desc_flag

  //  this.updated_at = new Date()
};

Product.getTotalPrice = async function getTotalPrice(itemlist, makeit_userid, result) {  //=> praveen // makeit_userid
  var totalamount = 0;
  var vegtype     = 0;
  var itemdetail  = {};
  //=> praveen // var product_commission_percentage = constant.product_commission_percentage;
  //=> praveen // var makeit_userid = "185";
  var commission_percentage = await query("select commission from MakeitUser where userid="+makeit_userid);
  var product_commission_percentage = commission_percentage[0].commission;

  for (var i = 0; i < itemlist.length; i++) {
    const menuitem = await query("Select * From Menuitem where menuitemid = '" + itemlist[i].itemid + "'");
    if (menuitem.length!==0) {
      if (menuitem[0].vegtype === "1") vegtype = "1";
      var amount = menuitem[0].price * itemlist[i].quantity;
     
      totalamount = totalamount + amount;
      //var commision_price = (totalamount / 100) * product_commission_percentage; //this code is commanded 24-09-2019
      var commision_price = totalamount * (100 / product_commission_percentage); 
      //var original_price = totalamount + commision_price;
      var original_price =  commision_price;
    }
  }
 
  itemdetail.price          = Math.round(original_price,0);
  itemdetail.original_price = Math.round(totalamount,0);
  itemdetail.vegtype        = vegtype;
  return itemdetail;
};

Product.createProduct = async function createProduct(newProduct,itemlist,packageList,result) {
  //console.log(itemlist);
  //=> praveen // var Productdetail = await Product.getTotalPrice(itemlist);
  var Productdetail = await Product.getTotalPrice(itemlist,newProduct.makeit_userid);

  newProduct.price          = Productdetail.price;
  newProduct.original_price = Productdetail.original_price;
  newProduct.vegtype        = Productdetail.vegtype;
  
  // console.log(Productdetail);
  sql.beginTransaction(function(err) {
    if (err) { throw err; }
    sql.query("INSERT INTO Product set ?", newProduct, function(err, res) {
      console.log("newProduct--err",err);
      if (err) { 
        sql.rollback(function() {
          result(err, null);
        });
      } else {
     // console.log("res",res.insertId);
      var productid = res.insertId;
      for (var i = 0; i < itemlist.length; i++) {
        var product_item = new Productitem(itemlist[i]);
        product_item.productid = productid;
        Productitem.createProductitems(product_item, function(err, result) {
          if (err) { 
            sql.rollback(function() {
              throw err;
            });
          }  
        });
      }
      if(packageList.length>0){
        for (var i = 0; i < packageList.length; i++) {
          var package_item = new Packageitem(packageList[i]);
          package_item.product_id = productid;
          package_item.makeit_id = newProduct.makeit_userid;
          package_item.package_id = packageList[i].id;
          Packageitem.createPackageitems(package_item, function(err, result) {
            if (err) { 
              sql.rollback(function() {
                throw err;
              });
            }  
          });
        }
      }
        
      let mesobj = "Product Created successfully";
      let resobj = {
        success: true,
        status:true,
        message: mesobj,
        productid: productid
      };
       sql.commit(function(err) {
        if (err) { 
         sql.rollback(function() {
           result(null, resobj);
          });
        }
        result(null, resobj);
    });
  }
  });
});
  // sql.query("INSERT INTO Product set ?", newProduct, function(err, res) {
  //   if (err) {
  //     console.log("error: ", err);
  //     result(err, null);
  //   } else {
  //     var productid = res.insertId;

  //     for (var i = 0; i < itemlist.length; i++) {
  //       var product_item = new Productitem(itemlist[i]);
  //       product_item.productid = productid;
  //       Productitem.createProductitems(product_item, function(err, result) {
  //         if (err) {
  //           console.log("error: ", err);
  //           result(err, null);
  //         } 
  //       });
  //     }

     
  //     let mesobj = "Product Created successfully";
  //     let resobj = {
  //       success: true,
  //       status:true,
  //       message: mesobj,
  //       productid: productid
  //     };

  //     result(null, resobj);
  //   }
  // });
};

Product.getProductById = function getProductById(userId, result) {
  sql.query("Select * from Product where productid = ? ", userId, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log("Menuitem : ", res);
      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Product.getAllProduct = function getAllProduct(result) {
  sql.query("Select * from Product where delete_status = 0 ", function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Product : ", res);
      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Product.getAllVirutalProduct = function getAllVirutalProduct(result) {
  sql.query("Select * from Product where active_status=0 ", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Product : ", res);

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Product.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Product SET image = ? WHERE productid = ?",
    [id.image, id.productid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("test");
        result(null, res);
      }
    }
  );
};

Product.remove = function(id, result) {
  sql.query("DELETE FROM Product WHERE productid = ?", [id], function(
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

Product.getAllliveProduct = function getAllliveProduct(liveproductid, result) {
  sql.query("Select * from Product where active_status = 1 and delete_status !=1 and makeit_userid = " +liveproductid.makeit_userid +"",async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
     
          var productcount = await query("Select count(productid) as productcount from Product where active_status = 1 and delete_status !=1 and quantity !=0 and makeit_userid = " +liveproductid.makeit_userid +" ");

        let resobj = {
          success: true,
          status :true,
          productcount : productcount[0].productcount,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Product.moveliveproduct = function(req, result) {
  console.log(req);
  var active_status = parseInt(req.active_status);
  if (active_status === 0) {
    sql.query(
      "UPDATE Product SET active_status = ? WHERE productid = ?",
      [req.active_status, req.productid],
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          var mesobj = {};
          let sucobj = true;
          mesobj = "Product removed from live successfully";
          let resobj = {
            success: sucobj,
            status: true,
            message: mesobj
          };

          result(null, resobj);
        }
      }
    );
  } else {
    sql.query(
      "select pt.approved_status,pt.active_status,mu.ka_status from Product pt left join MakeitUser mu on mu.userid = pt.makeit_userid where productid = '" + req.productid + "'",
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          if(res[0].approved_status !== 0 && res[0].active_status === 0 && res[0].ka_status === 2) {
            sql.query(
              "UPDATE Product SET active_status = ? WHERE productid = ?",
              [req.active_status, req.productid],
              function(err, res) {
                if (err) {
                  result(err,null);
                } else {
                  let sucobj = true;
                  var mesobj = "Product added to live successfully";
                  let resobj = {
                    success: sucobj,
                    status: true,
                    message: mesobj
                  };
                  result(null, resobj);
                }
              }
            );
          } else if (res[0].active_status === 1) {
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Following Product already in live."
            };

            result(null, resobj);
          }else if(res[0].ka_status !== 2){
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Sorry Product can't move to live,Your kitchen waiting for approval."
            };

            result(null, resobj);
          }else if (res[0].approved_status === 0){
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Sorry Product not yet approved,You can't move to live."
            };
            result(null, resobj);
          }
        }
      }
    );
  }
};

Product.productitemlist = function productitemlist(req, result) {
  sql.query(
    "select pt.itemid,pt.quantity,mi.menuitem_name,mi.price from Productitem pt join Menuitem mi on pt.itemid = mi.menuitemid where pt.productid = " +
      req.productid +
      "",
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Product.admin_list_all_product = function admin_list_all_product(req, result) {
  console.log(req);

  var query =
    "Select * from Product where makeit_userid = '" +
    req.makeit_userid +
    "' and delete_status !=1";
  if(req.approved_status){
    query = query +" and approved_status = '" +req.approved_status+ "'";
  }

  if(req.active_status){
    query =query +" and active_status = '" +req.active_status+ "'";
  }

  if (req.search) {
    query =query +" and product_name LIKE  '%" + req.search +"%'";
  }

  
  console.log(query);

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Product : ", res);
      let sucobj = true;
      let resobj = {
        success: sucobj,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};

Product.update_quantity_byid = function update_quantity_byid(req, result) {
  sql.query(
    " select * from Product where productid = " + req.productid + "",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res[0].approved_status === 1 && req.quantity>=4) {
          let resobj = {
            success: true,
            status: false,
            message:"Sorry Product live limit is exitded.only set 3."
          };
          result(null, resobj);
        }else if (res[0].approved_status !== 0) {
          sql.query(
            "UPDATE Product SET quantity = ? WHERE productid = ? and makeit_userid = ?",
            [req.quantity, req.productid, req.makeit_userid],
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                /////=Edit Live Product History =//////////
                req.action=2;
                Product.createliveproductstatushistory(req, function(err,result2){
                  if (err) {
                      result(err, null);
                  } else{
                      console.log(result2);
                  }
                });
                //////////////////////////////////////////
                let message = "Quantity added successfully";
                let resobj = {
                  success: true,
                  status : true,
                  message: message
                };
                result(null, resobj);
              }
            }
          );
         } else if (res[0].approved_status == 0) {
          console.log("product live");
          let resobj = {
            success: true,
            status: false,
            message:
              "Sorry Product not yet approved, You can't quantity increase"
          };

          result(null, resobj);
        }
      }
    }
  );
};

Product.update_quantity_product_byid = function update_quantity_product_byid(
  req,
  result
) {
  console.log(req);

  const active_status = parseInt(req.active_status)
  
  if (active_status === 0) {
    sql.query(
      "UPDATE Product SET active_status = ?,quantity = 0 WHERE productid = ?",
      [req.active_status, req.productid],
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {

          var mesobj = {};
          let sucobj = true;
          mesobj = "Product removed from live successfully";
          let resobj = {
            success: sucobj,
            status: true,
            message: mesobj
          };

          result(null, resobj);
        }
      }
    );
  } else{
    sql.query(
      "select pt.approved_status,pt.active_status,mu.ka_status from Product pt left join MakeitUser mu on mu.userid = pt.makeit_userid where productid = '" + req.productid + "'",
      function(err, res1) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          if(res1[0].ka_status !== 2){
            let resobj = {
              success: true,
              status: false,
              message: "Sorry Product can't move to live,Your kitchen waiting for approval."
            };

            result(null, resobj);
          }else if (res1[0].approved_status === 1 && req.quantity>=4) {
            let resobj = {
              success: true,
              status: false,
              message:"Sorry Product live limit is exitded. only set 3."
            };
            result(null, resobj);
          }else if (res1[0].approved_status !== 0) {
            sql.query(
              "UPDATE Product SET quantity = ?,active_status = ? WHERE productid = ? and makeit_userid = ?",
              [
                req.quantity,
                req.active_status,
                req.productid,
                req.makeit_userid
              ],
              function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  /////=Add Live Product History =//////////
                  req.action=1;
                  Product.createliveproductstatushistory(req, function(err,result2){
                    if (err) {
                          result(err, null);
                        } else{
                          console.log(result2);
                        }
                  });
                  /////////////////////////////////////////
                  let message =
                    "Quantity added and product moved to live successfully";
                  let resobj = {
                    success: true,
                    message: message,
                    status: true
                  };
                  result(null, resobj);
                }
              }
            );
          } else if (res1[0].approved_status === 0) {
           
            let resobj = {
              success: true,
              status: false,
              message: "Sorry Product not yet approved, You can't move to live"
            };

            result(null, resobj);
          } else {
            let resobj = {
              success: true,
              status: false,
              message: "Sorry Product not yet approved, You can't move to live"
            };

            result(null, resobj);
          }
        }
      }
    );
  }
};

Product.quantitydecrease = function(orderlist, result) {
  sql.query(
    "update Product set quantity= quantity-? WHERE productid = ",
    [orderlist.quantity, orderlist.productid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("test");
        result(null, res);
      }
    }
  );
};

Product.update_a_product_by_makeit_userid = function(req, items, result) {
  sql.query(
    " select * from Product where productid = " + req.productid + "",
    async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res[0].active_status+"--cc--"+res[0].approved_status);

        if (res[0].approved_status === 1 ||res[0].active_status == 0) {
          var Productdetail = await Product.getTotalPrice(items,req.makeit_userid);
          req.price = Productdetail.price;
          req.vegtype = Productdetail.vegtype;
          req.original_price = Productdetail.original_price;
          var staticquery = "UPDATE Product SET ";
          var column = "";
          
          for (const [key, value] of Object.entries(req)) {
            if (key !== "productid" && key !== "items"&& key !== "packageItems" ) {
              column = column + key + "='" + value + "',";
            }
          }
          var itemid = "";
          for (var i = 0; i < items.length; i++) {
            var product_item = items[i];
            itemid = itemid + product_item.itemid + ",";
            product_item.productid = req.productid;

            Productitem.updateProductitems(product_item, function(err, result) {
              if (err) res.send(err);
            });
          }
          itemid = itemid.slice(0, -1);
          Productitem.deleteProductitems(
            req.productid,
            itemid,
            function(err, result) {
              if (err) res.send(err);
            }
          );
///Package Update///

var package_id = "";
var packageItems = req.packageItems|| [];
console.log("packageItems-->",packageItems.length);
for (var i = 0; i < packageItems.length; i++) {
  var package_item = new Packageitem(packageItems[i]);
  package_id = package_id + packageItems[i].id + ",";
  package_item.product_id = req.productid;
  package_item.package_id=packageItems[i].id ;
  package_item.makeit_id=req.makeit_userid
  Packageitem.updatePackageitems(package_item, function(err, result) {
    if (err) res.send(err);
  });
}
package_id = package_id.slice(0, -1);
Packageitem.deletePackageitems(
  req.productid,
  package_id,
  function(err, result) {
    if (err) res.send(err);
  }
);

          


          var query =
            staticquery +
            column.slice(0, -1) +
            " where productid = " +
            req.productid;

          sql.query(query, function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
      
              let resobj = {
                success: true,
                status: true,
                message: "Product updated successfully"
              };

              result(null, resobj);
            }
          });
        } else if (res[0].active_status == 1) {
          
          let resobj = {
            success: true,
            status: false,
            message: "Sorry Product is live now, You can't edit"
          };

          result(null, resobj);
        }
      }
    }
  );
};

Product.edit_product_by_makeit_userid = function(req, items, result) {
  sql.query(
    " select * from Product where productid = " + req.productid + "",
    async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var approved_status= res[0].approved_status===2?4:res[0].approved_status;
        if (res[0].active_status == 0) {
          //=>praveen // var Productdetail = await Product.getTotalPrice(items);
          var Productdetail = await Product.getTotalPrice(items,req.makeit_userid);
          
          req.price = Productdetail.price;
          req.original_price = Productdetail.original_price;
          req.vegtype = Productdetail.vegtype;
          
          var staticquery = "UPDATE Product SET updated_at =?,";
          var column = "";

          //make the edited product column query without productid and items array
          for (const [key, value] of Object.entries(req)) {
          //console.log(`${key} ${value}`);

            if (key !== "productid" && key !== "items") {
              // var value = `=${value}`;
              column = column + key + "='" + value + "',";
            }
          }
          var itemid = "";
          // add new item and update item count for edit state
          for (var i = 0; i < items.length; i++) {
            var product_item = items[i];
            itemid = itemid + product_item.itemid + ",";
            product_item.productid = req.productid;
            product_item.delete_status = 0.;
            Productitem.updateProductitems(product_item, function(err, result) {
              if (err) res.send(err);
              // res.json(result);
            });
          }
          itemid = itemid.slice(0, -1);
          // remove deleted items for edit state.
          Productitem.deleteProductitems(
            product_item.productid,
            itemid,
            function(err, result) {
              if (err) res.send(err);
            }
          );

          var query =
            staticquery +
            column.slice(0, -1) +
            " ,approved_status = "+approved_status+" where productid = " +
            req.productid;
          console.log(query);

          sql.query(query, new Date(), function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              let sucobj = true;
              let message = "Product updated successfully";
              let resobj = {
                success: sucobj,
                status: true,
                message: message
              };

              result(null, resobj);
            }
          });
        } else if (res[0].active_status == 1) {
          console.log("product live");
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: false,
            message: "Sorry Product is live now, You can't edit"
          };

          result(null, resobj);
        }
      }
    }
  );
};

Product.productview_by_productid = function productview_by_productid(
  req,
  result
) {
  const items = [];
  sql.query(
    " select pd.*,JSON_OBJECT('userid',mk.userid,'name',mk.name,'phoneno',mk.phoneno,'email',mk.email,'address',mk.address,'lat',mk.lat,'lon',mk.lon,'brandName',mk.brandName,'localityid',mk.localityid,'virtualkey',mk.virtualkey,'ka_status',mk.ka_status) as makeitdetail from Product pd left join MakeitUser mk on mk.userid=pd.makeit_userid where productid = " + req.productid + "",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        var menuItemQuery="select pi.quantity,mi.price,mi.menuitemid,mi.menuitem_name,mi.vegtype,mi.approved_status from Productitem pi join Menuitem mi on mi.Menuitemid = pi.itemid where pi.productid ="+req.productid
        var packageQuery=menuItemQuery+";"+"select * from ProductPackaging join PackagingBox pb on pb.id = package_id where product_id = "+ req.productid
        sql.query(packageQuery,
          function(err, resArray) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              console.log(resArray[0]);
              var resProductItems=resArray[0];
              var resPackageItems=resArray[1];
              // for (let i = 0; i < res1.length; i++) {
              //   items.push(res1[i]);
              // }

              res[0].makeitdetail = JSON.parse(res[0].makeitdetail);
              res[0].items = resProductItems;
              res[0].packageItems = resPackageItems;
              let sucobj = true;
              let resobj = {
                success: sucobj,
                result: res
              };

              result(null, resobj);
            }
          }
        );
      }
    }
  );
};

Product.update_delete_status = function(id, result) {
  sql.query(" select * from Product where productid = " + id + "", function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      if (res.length !== 0) {
        if (res[0].active_status == 0) {
          console.log("test1");

          if (res[0].delete_status !== 1) {
            sql.query(
              "UPDATE Product SET delete_status = 1 WHERE productid = " +
                id +
                "",
              function(err, res1) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  sql.query(
                    "UPDATE Productitem SET delete_status = 1 WHERE productid = " +
                      id +
                      "",
                    function(err, res2) {
                      if (err) {
                        console.log("error: ", err);
                        result(null, err);
                      }
                    }
                  );
                  let sucobj = true;
                  let resobj = {
                    success: sucobj,
                    status: true,
                    message: "Product Delete successfully"
                  };

                  result(null, resobj);
                }
              }
            );
          } else {
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Product already deleted"
            };

            result(null, resobj);
          }
        } else if (res[0].active_status == 1) {
          console.log("test");
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: false,
            message: "Product is live now, You can't delete"
          };

          result(null, resobj);
        }
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          status: false,
          message: "Product is not available"
        };

        result(null, resobj);
      }
    }
  });
};

Product.approve_product_status = function(req, result) {
  sql.query("select * from Product where productid = " + req.productid + " ",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res.length);
        if (res.length !== 0) {
            if (res[0].approved_status === 1|| res[0].approved_status === 4) {
              var query =
                "UPDATE Product SET approved_time = ?,approved_status = " +
                req.approved_status +
                ",approvedby= 1 WHERE productid = " +
                req.productid +
                "";
              sql.query(query, new Date(), function(err, res1) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  let message = "Product approved successfully";
                  if(req.approved_status===3) message = "Product Rejected successfully";
                  

                  let sucobj = true;
                  let resobj = {
                    success: sucobj,
                    status: true,
                    message: message
                  };

                  result(null, resobj);
                }
              });
            } else if (res[0].approved_status === 2) {
              console.log("test" + res[0].approved_status);
              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: false,
                message: "Product already approved"
              };

              result(null, resobj);
            } else if (res[0].approved_status == 3) {
              console.log("Product already rejected");
              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: false,
                message: "Product already rejected"
              };

              result(null, resobj);
            }
          } else {
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: false,
            message: "Product is not available"
          };

          result(null, resobj);
        }
      }
    }
  );
};


Product.admin_list_all__unapproval_product = function admin_list_all__unapproval_product(req,result) {
  console.log(req);

  var query =
    "Select pd.*,mk.brandname,mk.name as makeit_name from Product pd left join MakeitUser mk on mk.userid=pd.makeit_userid  where delete_status !=1 ";

  query =query +" and approved_status = '"+req.approved_status +"' order by created_at desc";
  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Product : ", res);
      let sucobj = true;
      let resobj = {
        success: sucobj,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};

Product.getAllProductbymakeituserid = function getAllProductbymakeituserid(req,result) {
  sql.query(
    "Select * from Product where delete_status = 0 and  makeit_userid = '" +req.makeit_userid +"' ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        
      
        let resobj = {
          success: true,
          status: true,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

//////// Live Product Status ////////
Product.getliveProductstatus = function getliveProductstatus(liveproductid, result) {
  //console.log(liveproductid);
  if(liveproductid.makeit_userid){
    var query="select prd.makeit_userid,prd.productid,prd.product_name,prd.quantity as actival_quantity,if(oi.quantity,oi.quantity,0) as ordered_quantity,(prd.quantity+if(oi.quantity,oi.quantity,0)) as total_quantity  from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on oi.orderid = ord.orderid where prd.active_status = 1 and prd.delete_status !=1 and  prd.makeit_userid="+liveproductid.makeit_userid+" group by prd.productid";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success : true,
            status  : true,
            result  : res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success : true,
            message : "Sorry! no data found.",
            status  : false
          };
          result(null, resobj);
        }
      }
    });
  }else{
    result(err, null);
  } 
};

///////////// Log History add and edit /////////////////////////
Product.createliveproductstatushistory = async function(req, result) {
  //console.log(req);
  if(req.productid && req.action){
    const getproductdetails = await query("select "+req.action+" as action,prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN oi.quantity ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 and payment_status<2 THEN oi.quantity ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 and prd.productid="+req.productid+" group by prd.productid");
    if (getproductdetails.err) {
      result(err, null);
    }else{
      var inserthistory = await producthistory.createProducthistory(getproductdetails);
      let resobj = {
        success : true,
        message : "Live Product History Created Successfully",
        status  : false,
        result  : inserthistory
      };
      result(null, resobj);
    }
  }else{
    result(err, null);
  }
};

///////////// Cron Log History /////////////////////////
Product.croncreateliveproductstatushistory = async function(req, result) {
  var breatfastcycle = constant.breatfastcycle;
  var lunchcycle     = constant.lunchcycle;
  var dinnercycle    = constant.dinnerend+1; //22+1
  var day            = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour    = moment(day).format("HH");
  var CSselectquery  = "";
  var CSwherequery   = "";
  var CEselectquery  = "";
  var CEwherequery   = "";
  var cyclestart = 0;
  var cycleend   = 0;
  
  if(currenthour==breatfastcycle){
    cyclestart = 1;
    /////Cycle Start ////
    CSselectquery = " 3 as action,";
    CSwherequery  = " and prd.breakfast=1";
  }else if(currenthour==lunchcycle){
    cycleend   = 1;
    cyclestart = 1;
    /////Cycle End ////
    CEselectquery = " 4 as action,";
    CEwherequery  = " and prd.breakfast=1";
    /////Cycle Start ////
    CSselectquery = " 3 as action,";
    CSwherequery  = " and prd.lunch=1";      
  }else if(currenthour==dinnercycle){
    cycleend   = 1;
    cyclestart = 1;
    /////Cycle End ////
    CEselectquery = " 4 as action,";
    CEwherequery  = " and prd.lunch=1";
    /////Cycle Start ////
    CSselectquery = " 3 as action,";
    CSwherequery  = " and prd.dinner=1";      
  }else if(currenthour==23){
    cycleend = 1;
    /////Cycle End ////
    CEselectquery = " 4 as action,";
    CEwherequery  = " and prd.dinner=1";
  }else{ }

  if(breatfastcycle && lunchcycle && dinnercycle){
    if(cyclestart == 1){
      const getproductdetailscs = await query("select"+CSselectquery+" prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN oi.quantity ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 THEN oi.quantity ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 "+CSwherequery+" group by prd.productid");
      if (getproductdetailscs.err) {
        result(err, null);
      }else{
        for(var i=0; i<getproductdetailscs.length; i++){
          var inserthistory = await producthistory.createProducthistory(getproductdetailscs[i]);
        }
        let resobjcs = {
          success : true,
          message : "Cycle Start Live Product History Created Successfully",
          status  : false,
          result  : inserthistory
        };
        result(null, resobjcs);
      }
    }else{
      let resobj = {
        success : true,
        message : "This is not a time for run this cron job",
        status  : false
      };
      result(null, resobj);
    }

    if(cycleend == 1){
      const getproductdetailsce = await query("select"+CEselectquery+" prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN oi.quantity ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 THEN oi.quantity ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 "+CEwherequery+" group by prd.productid");
      if (getproductdetailsce.err) {
        result(err, null);
      }else{
        for(var i=0; i<getproductdetailsce.length; i++){
          var inserthistory = await producthistory.createProducthistory(getproductdetailsce);
        }
        let resobjce = {
          success : true,
          message : "Cycle End Live Product History Created Successfully",
          status  : false,
          result  : inserthistory
        };
        result(null, resobjce);
      }
    }else{
      let resobj = {
        success : true,
        message : "This is not a time for run this cron job",
        status  : false
      };
      result(null, resobj);
    }
  }else{
    result(err, null);
  } 
};

module.exports = Product;