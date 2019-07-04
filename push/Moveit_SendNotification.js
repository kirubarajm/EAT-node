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
    var firebaseRef = Move_it.database().ref();
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

exports.geoFireGetKeyByGeo= async function(geoLocation,radius,result){
  initializeAppName();
  var make_it_id=[]
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });
  
  var onKeyEnteredRegistration = await geoQuery.on("key_entered", function(key, location, distance) {
    console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key);
  });
  console.log('geoQuery-->'+onKeyEnteredRegistration);
  result(null,onKeyEnteredRegistration);
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