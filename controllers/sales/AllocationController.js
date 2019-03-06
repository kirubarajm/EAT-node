'use strict';

var Allocation = require('../../model/sales/allocationModel.js');

exports.list_all_allocation = function(req, res) {
  Allocation.getAllAllocation(function(err, allocation) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', allocation);
    res.send(allocation);
  });
};

exports.list_all_allocation_by_salesempid = function(req, res) {
  Allocation.getAllocationBySalesEmpId(req.params.id,function(err, allocation) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', allocation);
    res.send(allocation);
  });
};




exports.create_a_allocation = function(req, res) {
  var new_allocation = new Allocation(req.body);
  console.log(new_allocation);
  //handles null error 
   if(!new_allocation.sales_emp_id){
            res.status(400).send({ error:true, message: 'Please provide sales_emp_id' });
    }
  else{
  Allocation.createAllocation(new_allocation, function(err, allocation) {
    if (err)
      res.send(err);
    res.json(allocation);
  });
  }
};


exports.read_a_allocation = function(req, res) {
  Allocation.getAllocationById(req.params.id, function(err, allocation) {
    if (err)
      res.send(err);
    res.json(allocation);
  });
};


exports.update_a_allocation = function(req, res) {
 Allocation.updateById(req.params.id, new Allocation(req.body), function(err, allocation) {
    if (err)
      res.send(err);
    res.json(allocation);
  });
};


exports.delete_a_allocation = function(req, res) {
 Allocation.remove( req.params.id, function(err, allocation) {
    if (err)
      res.send(err);
    res.json({ message: 'Allocation successfully deleted' });
  });
};

