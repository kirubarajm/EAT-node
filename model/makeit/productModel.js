'user strict';
var sql = require('../db.js');
var Productitem = require('../../model/makeit/productitemsModel.js');

//Task object constructor
var Product = function(product){
    this.makeit_userid = product.makeit_userid;
    this.product_name=product.product_name;
    this.active_status=product.active_status;
    this.vegtype=product.vegtype;
    this.image=product.image;
    this.preparetime=product.preparetime;
    this.price=product.price;
    this.breakfast=product.breakfast;
    this.lunch=product.lunch;
    this.dinner=product.dinner;
    this.monday=product.monday;
    this.tuesday=product.tuesday;
    this.wednesday=product.wednesday;
    this.thrusday=product.thrusday;
    this.friday=product.friday;
    this.saturday=product.saturday;
    this.sunday=product.sunday;
    this.created_at = new Date();
    this.quantity = product.quantity ||0;
    this.cusine = product.cusine;

};


Product.createProduct = function createProduct(newProduct,itemlist, result) {   
  
  
        sql.query("INSERT INTO Product set ?", newProduct, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                   
                   var productid = res.insertId

                   for(var i = 0; i < itemlist.length; i++){
                     
                    var product_item = new Productitem(itemlist[i]);
                
                    product_item.productid = productid;

                    Productitem.createProductitems(product_item, function (err, result) {
                      if (err)
                          res.send(err);
                      res.json(result);
                  });
                }

                  let sucobj=true;
                  let mesobj = "Product Item Created successfully";
                  let resobj = {  
                  success: sucobj,
                  message:mesobj,
                  productid: productid
                       }; 

                  result(null, resobj);
      
                 }  

               
                
                
            });           
};

Product.getProductById = function getProductById(userId, result) {
        sql.query("Select * from Product where productid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                  console.log('Menuitem : ', res); 
                  let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    result: res 
                    }; 

                 result(null, resobj);
              
                }
            });   
};

Product.getAllProduct = function getAllProduct(result) {
        sql.query("Select * from Product", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Product : ', res);  
                  let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    result: res 
                    }; 

                 result(null, resobj);
                }
            });   
};

Product.getAllVirutalProduct = function getAllVirutalProduct(result) {
        sql.query("Select * from Product where active_status=0", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Product : ', res);  

                 let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    result: res 
                    }; 

                 result(null, resobj);
                }
            });   
};

Product.updateById = function(id, user, result){
  sql.query("UPDATE Product SET image = ? WHERE productid = ?", [id.image, id.productid], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             console.log('test');
             result(null, res);
                }
            }); 
};

Product.remove = function(id, result){
     sql.query("DELETE FROM Product WHERE productid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};


Product.getAllliveProduct = function getAllliveProduct(liveproductid,result) {
  sql.query("Select * from Product where active_status = '1' and makeit_userid = "+liveproductid.makeit_userid+"", function (err, res) {

          if(err) {
              console.log("error: ", err);
              result(null, err);
          }
          else{
            console.log('Product : ', res);  
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              result: res 
              }; 

           result(null, resobj);
          }
      });   
};




Product.moveliveproduct = function(req,result){
  sql.query("UPDATE Product SET active_status = ? WHERE productid = ?",[req.active_status,req.productid], function (err, res) {
       
    if(err) {
      console.log("error: ", err);
      result(null, err);
  }
  else{
    var mesobj = {};
    let sucobj=true;
     if(req.active_status == 1){
           mesobj = "Product added to live successfully";
          }else{
          mesobj = "Product removed from live successfully";
         }
   // let mesobj = "Product added live successfully";
    let resobj = {  
      success: sucobj,
      message:mesobj 
      }; 

   result(null, resobj);
  }
});   
};



Product.productitemlist = function productitemlist(req,result) {

  sql.query("select pt.itemid,pt.quantity,mi.menuitem_name from Productitem pt join Menuitem mi on pt.itemid = mi.menuitemid where pt.productid = "+req.productid+"", function (err, res) {

          if(err) {
              console.log("error: ", err);
              result(null, err);
          }
          else{
            console.log('Product : ', res);  
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              result: res 
              }; 

           result(null, resobj);
          }
      });   
};


Product.admin_list_all_product = function admin_list_all_product(req,result) {


    var query = "Select * from Product where makeit_userid = '"+req.makeit_userid+"'"

    if(req.search){
      query = query+" and (product_name LIKE  '%"+req.search+"%')";
   }
      
   
        sql.query(query, function (err, res) {

          if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          console.log('Product : ', res);  
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            result: res 
            }; 

         result(null, resobj);
        }
});   
};


Product.update_quantity_byid = function update_quantity_byid (req, result){

  sql.query("UPDATE Product SET quantity = ? WHERE productid = ? and makeit_userid = ?", [req.quantity,req.productid, req.makeit_userid], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }else{  
              let sucobj=true;
              let message = "Quantity added successfully";
              let resobj = {  
                success: sucobj,
                message:message,
                }; 
             result(null, resobj);
            }
           
            }); 
};



Product.update_quantity_product_byid = function update_quantity_product_byid (req, result){

  sql.query("UPDATE Product SET quantity = ?,active_status = ? WHERE productid = ? and makeit_userid = ?", [req.quantity,req.active_status,req.productid, req.makeit_userid], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }else{  
              let sucobj=true;
              let message = "Quantity added successfully / Product Moved live successfully";
              let resobj = {  
                success: sucobj,
                message:message,
                }; 
             result(null, resobj);
            }
           
            }); 
};



Product.quantitydecrease = function(orderlist, result){



    sql.query("update Product set quantity= quantity-? WHERE productid = ", [orderlist.quantity, orderlist.productid], function (err, res) {
      if(err) {
          console.log("error: ", err);
            result(null, err);
         }
       else{   
         console.log('test');
         result(null, res);
            }
        }); 
    
  


  
};


module.exports= Product;