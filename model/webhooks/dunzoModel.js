'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');

//Task object constructor
var Dunzo = function(dunzo){
    this.makeit_userid = dunzo.makeit_userid;
    this.rating = dunzo.rating;
};

Dunzo.testingapi = function testingapi(req, result) {
    console.log(dunzoconst);
    result(null, req);
};

module.exports= Dunzo;