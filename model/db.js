'user strict';

var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection({
    host     : 'eatinstance.crelormihi5z.ap-south-1.rds.amazonaws.com',
    user     : 'eattovo',
    password : 'eattv2020',
    database : 'eattovo',
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;