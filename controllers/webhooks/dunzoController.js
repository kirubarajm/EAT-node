"use strict";

var Dunzo = require("../../model/webhooks/dunzoModel.js");

exports.testapi = function(req, res) {
    Dunzo.testingapi(req.body, function(err, dunzo) {
        if (err) res.send(err);
        res.json(dunzo);
      });
    
};