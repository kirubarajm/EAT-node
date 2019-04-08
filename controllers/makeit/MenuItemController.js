'use strict';

var Menuitem = require('../../model/makeit/menuItemModel.js');

exports.list_all_menuitem = function(req, res) {
  Menuitem.getAllMenuitem(function(err, menuitem) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', menuitem);
    res.send(menuitem);
  });
};


exports.create_a_menuitem = function(req, res) {
  var new_menuitem = new Menuitem(req.body);
  console.log(new_menuitem);
  //handles null error 
   if(!new_menuitem.menuitem_name){
            res.status(400).send({ error:true, message: 'Please provide name' });
    }
  else{
  Menuitem.createMenuitem(new_menuitem, function(err, menuitem) {
    if (err)
      res.send(err);
    res.json(menuitem);
  });
  }
};


exports.read_a_menuitem = function(req, res) {
  Menuitem.getMenuitemById(req.params.id, function(err, menuitem) {
    if (err)
      res.send(err);
    res.json(menuitem);
  });
};


exports.update_a_menuitem = function(req, res) {
 Menuitem.updateById(req.params.id, new Menuitem(req.body), function(err, menuitem) {
    if (err)
      res.send(err);
    res.json(menuitem);
  });
};


exports.delete_a_menuitem = function(req, res) {
 Menuitem.remove( req.params.id, function(err, menuitem) {
    if (err)
      res.send(err);
    res.json({ message: 'Menuitem successfully deleted' });
  });
};



exports.read_a_menuitem_byid = function(req, res) {
  Menuitem.get_Menuitem_By_makeitid(req.params.makeit_userid, function(err, menuitem) {
    if (err)
      res.send(err);
    res.json(menuitem);
  });
};

exports.update_a_menuitem = function(req, res) {
  Menuitem.update_a_menuitem_makeit_userid(req.body, function(err, menuitem) {
     if (err)
       res.send(err);
     res.json(menuitem);
   });
 };