const firebase = require("firebase-admin");
var geoFires = require('geofire');
var MoveitserverKey = require("../moveit-a9128-firebase-adminsdk-3h0b8-6315acfc79");
var Move_it = null;
var geoFire =null;

function initializeAppName() {
  if (!Move_it) {
    Move_it = firebase.initializeApp(
      {
        credential: firebase.credential.cert(MoveitserverKey),
        databaseURL: "https://moveit-a9128.firebaseio.com/"
      },
      "move-it-app"
    );
    var firebaseRef = Move_it.database().ref('location');
    geoFire = new geoFires.GeoFire(firebaseRef);
    
  }else{
    
    console.log("Move_it name--->" + Move_it.name);
  }
};


exports.geoFireInsert= function(id,geoLocation,result){
  initializeAppName();
  if(!geoFire)  result(false,null);
  else{
  geoFire.set(id, geoLocation).then(function() {
    console.log("Provided key has been added to GeoFire");
    result(null,true);
  }, function(error) {
    console.log("Error: " + error);
    result(error,null);
  });
}
}

async function onGetKeyEntered(){
  var make_it_id=[];
   geoQuery.on("key_entered", function(key, location, distance) {
    //console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key)
  });

  
  return make_it_id;
}

exports.geoFireGetKeyByGeo= function(geoLocation,radius,result){
  initializeAppName();
  //console.log("geoLocation-->"+geoLocation);
  var make_it_id=[];
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });
  
  var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
    console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key);
  });

  var onReadyRegistration = geoQuery.on("ready", function() {
    console.log("GeoQuery has loaded and fired all other events for initial data-->"+make_it_id);
    result(null,make_it_id);
    geoQuery.cancel();
  });
}

exports.geoFireGetKeyByGeoMakeit= function(geoLocation,radius){
  initializeAppName();
  var make_it_id=[];
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });
  
  var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
    console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key);
  });

  var onReadyRegistration = geoQuery.on("ready", function() {
    console.log("GeoQuery has loaded and fired all other events for initial data-->"+make_it_id);
    geoQuery.cancel();
    return make_it_id;
  });
  return make_it_id;
}

exports.sendNotificationAndroid = function(
  token,
  dat,
) {
  initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };
  console.log("token:"+token);
  var payload = {
    data: dat
  };
  console.log("payload:"+payload.data.title);
  Move_it.messaging().sendToDevice(token, payload, options);
};