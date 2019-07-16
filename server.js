const express = require("express"),
  app = express(),
  bodyParser = require("body-parser");

port = process.env.PORT || 3000;
var cors = require("cors");

//   for (var k in VERSIONS) {
//     app.use(VERSIONS[k], require('./routes' + VERSIONS[k]));
// }

app.listen(port);
const fileUpload = require("express-fileupload");

console.log("API server started on: " + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// default options
app.use(fileUpload());
app.use(express.static(__dirname));

var routes = require("./routes/appRoutes"); //importing route
var eatRoutes = require("./routes/eatRoutes"); //importing eat route
var makeitRoutes = require("./routes/makeitRoutes"); //importing makeit route
var salestRoutes = require("./routes/salesRoutes"); //importing makeit route
var moveitRoutes = require("./routes/moveitRoutes"); //importing makeit route
var adminRoutes = require("./routes/adminRoutes"); //importing makeit route
routes(app); //register the routes
eatRoutes(app); //register the eat routes
makeitRoutes(app); //register the make it routes
salestRoutes(app); //register the sales routes
moveitRoutes(app); //register the move it routes
adminRoutes(app); //register the admin routes
