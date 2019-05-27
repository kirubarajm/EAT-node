"user strict";
var sql = require("../db.js");
var Productitem = require("../../model/makeit/productitemsModel.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
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
  this.approved_status = product.approved_status || 0;

  //  this.updated_at = new Date()
};

Product.getTotalPrice = async function createProduct(itemlist, result) {
  var totalamount = 0;
  var vegtype = 0;
  var itemdetail = {};
  for (var i = 0; i < itemlist.length; i++) {
    const menuitem = await query(
      "Select * From Menuitem where menuitemid = '" + itemlist[i].itemid + "'"
    );
    if (menuitem.length!==0) {
      if (menuitem[0].vegtype === "1") vegtype = "1";
      amount = menuitem[0].price * itemlist[i].quantity;
      totalamount = totalamount + amount;
    }
  }
  itemdetail.price = totalamount;
  itemdetail.vegtype = vegtype;
  return itemdetail;
};

Product.createProduct = async function createProduct(
  newProduct,
  itemlist,
  result
) {
  var Productdetail = await Product.getTotalPrice(itemlist);
  newProduct.price = Productdetail.price;
  newProduct.vegtype = Productdetail.vegtype;
  sql.query("INSERT INTO Product set ?", newProduct, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      var productid = res.insertId;

      for (var i = 0; i < itemlist.length; i++) {
        var product_item = new Productitem(itemlist[i]);
        product_item.productid = productid;
        Productitem.createProductitems(product_item, function(err, result) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          } 
        });
      }

     
      let mesobj = "Product Created successfully";
      let resobj = {
        success: true,
        status:true,
        message: mesobj,
        productid: productid
      };

      result(null, resobj);
    }
  });
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
  sql.query(
    "Select * from Product where active_status = '1' and delete_status !=1 and makeit_userid = " +
      liveproductid.makeit_userid +
      "",
    function(err, res) {
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
      " select * from Product where productid = " + req.productid + "",
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          if (res[0].approved_status === 1 && res[0].active_status === 0) {
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
                  mesobj = "Product added to live successfully";

                  let resobj = {
                    success: sucobj,
                    status: true,
                    message: mesobj
                  };

                  result(null, resobj);
                }
              }
            );
          } else if (res[0].active_status == 1) {
            console.log("product live");
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Following Product already in live"
            };

            result(null, resobj);
          } else if (res[0].approved_status == 0) {
            console.log("product live");
            let sucobj = true;
            let resobj = {
              success: sucobj,
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

Product.productitemlist = function productitemlist(req, result) {
  sql.query(
    "select pt.itemid,pt.quantity,mi.menuitem_name from Productitem pt join Menuitem mi on pt.itemid = mi.menuitemid where pt.productid = " +
      req.productid +
      "",
    function(err, res) {
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
    }
  );
};

Product.admin_list_all_product = function admin_list_all_product(req, result) {
  console.log(req);

  var query =
    "Select * from Product where makeit_userid = '" +
    req.makeit_userid +
    "' and delete_status !=1";

  console.log(req.approved_status);

  if (req.search && req.approved_status === undefined) {
    console.log("search ");
    query = query + " and product_name LIKE  '%" + req.search + "%'";
  } else if (req.search === undefined && req.approved_status !== undefined) {
    console.log("approved_status ");
    query = query + " and approved_status = '" + req.approved_status + "'";
  } else if (req.search !== undefined && req.approved_status !== undefined) {
    console.log("search and approved_status ");
    query =
      query +
      " and approved_status = '" +
      req.approved_status +
      "' and product_name LIKE  '%" +
      req.search +
      "%'";
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
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res[0].approved_status === 1) {
          sql.query(
            "UPDATE Product SET quantity = ? WHERE productid = ? and makeit_userid = ?",
            [req.quantity, req.productid, req.makeit_userid],
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                let sucobj = true;
                let message = "Quantity added successfully";
                let resobj = {
                  success: sucobj,
                  message: message
                };
                result(null, resobj);
              }
            }
          );
         } else if (res[0].approved_status == 0) {
          console.log("product live");
          let sucobj = true;
          let resobj = {
            success: sucobj,
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
  } else {
    sql.query(
      " select * from Product where productid = " + req.productid + "",
      function(err, res1) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          if (res1[0].approved_status === 1) {
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
                  let sucobj = true;
                  let message =
                    "Quantity added and product moved to live successfully";
                  let resobj = {
                    success: sucobj,
                    message: message,
                    status: true
                  };
                  result(null, resobj);
                }
              }
            );
          } else if (res1[0].approved_status === 0) {
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Sorry Product not yet approved, You can't move to live"
            };

            result(null, resobj);
          } else {
            let sucobj = true;
            let resobj = {
              success: sucobj,
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
        console.log(res[0].active_status);

        if (res[0].active_status == 0) {
          var Productdetail = await Product.getTotalPrice(items);
          req.price = Productdetail.price;
          req.vegtype = Productdetail.vegtype;
          var staticquery = "UPDATE Product SET ";
          var column = "";

          for (const [key, value] of Object.entries(req)) {
            if (key !== "productid" && key !== "items") {
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
            product_item.productid,
            itemid,
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

Product.edit_product_by_makeit_userid = function(req, items, result) {
  sql.query(
    " select * from Product where productid = " + req.productid + "",
    async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res[0].active_status == 0) {
          var Productdetail = await Product.getTotalPrice(items);
          req.price = Productdetail.price;
          req.vegtype = Productdetail.vegtype;
          console.log(req);
          var staticquery = "UPDATE Product SET updated_at =?,";
          var column = "";

          for (const [key, value] of Object.entries(req)) {
            console.log(`${key} ${value}`);

            if (key !== "productid" && key !== "items") {
              // var value = `=${value}`;
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
              // res.json(result);
            });
          }
          itemid = itemid.slice(0, -1);
          Productitem.deleteProductitems(
            product_item.productid,
            itemid,
            function(err, result) {
              if (err) res.send(err);
              // res.json(result);
            }
          );

          var query =
            staticquery +
            column.slice(0, -1) +
            " ,approved_status = 3 where productid = " +
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
    " select * from Product where productid = " + req.productid + "",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        sql.query(
          "select pi.quantity,mi.price,mi.menuitemid,mi.menuitem_name,mi.vegtype,mi.approved_status from Productitem pi join Menuitem mi on mi.Menuitemid = pi.itemid where pi.productid = " +
            req.productid +
            "",
          function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              //console.log(res1[0]);
              for (let i = 0; i < res1.length; i++) {
                items.push(res1[i]);
              }

              res[0].items = items;
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
  sql.query(
    " select * from Product where productid = " + req.productid + " ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(res.length);
        if (res.length !== 0) {
          if (res[0].active_status === 0) {
            if (res[0].approved_status === 0 || res[0].approved_status === 3) {
              var query =
                "UPDATE Product SET approved_time= ?,approved_status = " +
                req.approved_status +
                ",approvedby=0 WHERE productid = " +
                req.productid +
                "";

              console.log(query);
              sql.query(query, new Date(), function(err, res1) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  let message = "Product approved successfully";
                  if(req.approved_status===2) message = "Product Rejected successfully";
                  

                  let sucobj = true;
                  let resobj = {
                    success: sucobj,
                    status: true,
                    message: message
                  };

                  result(null, resobj);
                }
              });
            } else if (res[0].approved_status == 1) {
              console.log("test" + res[0].approved_status);
              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: false,
                message: "Product already approved"
              };

              result(null, resobj);
            } else if (res[0].approved_status == 2) {
              console.log("Product already rejected");
              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: false,
                message: "Product already rejected"
              };

              result(null, resobj);
            }
          } else if (res[0].active_status == 1) {
            console.log("test");
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: false,
              message: "Product is live now"
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

Product.admin_list_all__unapproval_product = function admin_list_all__unapproval_product(
  req,
  result
) {
  console.log(req);

  var query =
    "Select * from Product where delete_status !=1 and active_status !=1 and approved_status !=1 and approved_status !=2 ";

  console.log(req.approved_status);

  if (req.approved_status === 0) {
    query =
      query +
      " and approved_status = '" +
      req.approved_status +
      "' order by created_at desc";
  } else if (req.approved_status === 3) {
    query =
      query +
      " and approved_status = '" +
      req.approved_status +
      "' order by updated_at desc";
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

Product.getAllProductbymakeituserid = function getAllProductbymakeituserid(
  req,
  result
) {
  sql.query(
    "Select * from Product where delete_status = 0 and  makeit_userid = '" +
      req.makeit_userid +
      "' and approved_status !=2",
    function(err, res) {
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
    }
  );
};

module.exports = Product;
