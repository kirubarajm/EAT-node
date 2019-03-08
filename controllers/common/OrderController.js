'use strict';

var Order = require('../../model/common/orderModel.js');

exports.list_all_product = function (req, res) {
  Order.getAllProduct(function (err, product) {
    console.log('controller')
    if (err)
      res.send(err);
    console.log('res', product);
    res.send(product);
  });
};


exports.eatuser_order_create = function (req, res) {
  var new_Order = new Order(req.body);
  var order_item = req.body.orderitems;
  //console.log(order_item);
  //console.log(new_Order);
  //handles null error 
  if (!new_Order.userid || !new_Order.price || !new_Order.makeit_user_id || !new_Order.delivery_charge) {

    res.status(400).send({ error: true, message: 'Please provide userid/price/makeit_user_id/delivery_charge' });

  }
  else {
    Order.createOrder(new_Order, order_item, function (err, result) {
      if (err)
        res.send(err);
      res.json(result);
    });
  }
};


exports.read_a_product = function (req, res) {
  Order.getProductById(req.params.id, function (err, product) {
    if (err)
      res.send(err);
    res.json(product);
  });
};


exports.update_a_product = function (req, res) {
  Order.updateById(req.params.id, new Product(req.body), function (err, product) {
    if (err)
      res.send(err);
    res.json(product);
  });
};


exports.delete_a_product = function (req, res) {
  Order.remove(req.params.id, function (err, product) {
    if (err)
      res.send(err);
    res.json({ message: 'Product successfully deleted' });
  });
};

exports.list_all_orders = function(req, res) {
  Order.get_all_orders(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.update_ordermovieit = function (req, res) {

  Order.ordermovieit(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.un_assign_orders = function (req, res) {
  Order.getUnassignorders(function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};