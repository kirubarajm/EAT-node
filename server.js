const express = require('express'),
  app = express(),
  bodyParser = require('body-parser');
  port = process.env.PORT || 3000;
  var cors = require('cors');
  const fs = require('fs');

app.listen(port);
const fileUpload = require('express-fileupload');

console.log('API server started on: ' + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// default options
app.use(fileUpload());
app.use(express.static(__dirname));

var routes = require('./routes/appRoutes'); //importing route
routes(app); //register the routes
