'user strict';
var sql = require('../db.js');

//Task object constructor
var Dunzo = function(dunzo){
    this.makeit_userid = dunzo.makeit_userid;
    this.rating = dunzo.rating;
};

Dunzo.testingapi = function testingapi(result) {
    console.log("123");
};

module.exports= Dunzo;