'user strict';

var authentication = require('../dbConnection.js');

var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection(authentication);

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;