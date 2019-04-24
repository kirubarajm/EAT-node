'use strict';

var master = require('../../model/common/masterModel');

exports.read_a_masters = function(req, res) {

  master.read_a_masters(req.params,function(err, result) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', result);
    res.send(result);
  });
};


