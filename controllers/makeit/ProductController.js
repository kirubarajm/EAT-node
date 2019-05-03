'use strict';

var Product = require('../../model/makeit/productModel.js');

exports.list_all_product = function(req, res) {
  Product.getAllProduct(function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};

exports.list_all_virtual_product = function(req, res) {
  Product.getAllVirutalProduct(function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};


exports.create_a_product = function(req, res) {
  var new_product = new Product(req.body);
   var itemlist = req.body.items;
  
   if(!new_product.product_name){
            res.status(400).send({ error:true, message: 'Please provide name' });
    }
  else{
  Product.createProduct(new_product,itemlist, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
  }
};


exports.read_a_product = function(req, res) {
  Product.getProductById(req.params.id, function(err, product) {
    if (err)
      res.send(err);
    res.json(product);
  });
};


exports.update_a_product = function(req, res) {
 Product.updateById(req.params.id, new Product(req.body), function(err, product) {
    if (err)
      res.send(err);
    res.json(product);
  });
};


exports.delete_a_product = function(req, res) {
 Product.update_delete_status( req.params.id, function(err, product) {
    if (err)
      res.send(err);
    res.json(product);
  });
};


exports.list_all_liveproduct = function(req, res) {
  Product.getAllliveProduct(req.params,function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};

exports.moveliveproduct = function(req, res) {

  console.log(req.body);
  Product.moveliveproduct(req.body, function(err, result) {
     if (err)
       res.send(err);
     res.json(result);
   });
 };

 exports.productitemlist = function(req, res) {

  Product.productitemlist(req.params,function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};


exports.admin_list_all_product = function(req, res) {
  Product.admin_list_all_product(req.body,function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};



// exports.add_quantity = function(req, res) {
//   console.log(req.body)
//   Product.update_quantity_byid(req.body, function(err, product) {
//      if (err)
//        res.send(err);
//      res.json(product);
//    });
//  };
 

 exports.add_quantity = function(req, res) {

  console.log(req.body);
  Product.update_quantity_byid(req.body, function(err, result) {
     if (err)
       res.send(err);
     res.json(result);
   });
 };


 exports.add_quantity_productlive = function(req, res) {

  if(!req.body.makeit_userid || !req.body.productid || !req.body.quantity){

    res.status(400).send({ error:true, message: 'Please provide productid / makeit_userid / quantity' });

}
else{
  Product.update_quantity_product_byid(req.body, function(err, result) {
     if (err)
       res.send(err);
     res.json(result);
   });
  }
 };


 exports.update_a_product_by_makeit_userid = function(req, res) {

    var items = req.body.items;
  Product.update_a_product_by_makeit_userid(req.body,items, function(err, product) {
     if (err)
       res.send(err);
     res.json(product);
   });
 };
 

 exports.productview = function(req, res) {
   
  Product.productview_by_productid(req.params,function(err, product) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', product);
    res.send(product);
  });
};


exports.delete_status_product = function(req, res) {
var  product = req.body.product;
  Product.update_delete_status( product, function(err, product) {
     if (err)
     res.send(err);
     res.json(product);
   });
 };
 