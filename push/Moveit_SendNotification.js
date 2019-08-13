const firebase = require("firebase-admin");
var geoFires = require('geofire');
var geodist = require('geodist')
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

exports.geoFireGetKeyByGeoMakeit= async function(geoLocation,make_it_list,result){
  initializeAppName();
   var make_it_id=[];
  // var geoQuery = geoFire.query({
  //   center: geoLocation,
  //   radius: radius
  // });
  
  // var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  //   console.log(key + " entered query at " + location + " (" + distance + " km from center)");
  //   make_it_id.push(key);
  // });

  // var onReadyRegistration = geoQuery.on("ready", function() {
  //   console.log("GeoQuery has loaded and fired all other events for initial data-->"+make_it_id);
  //   geoQuery.cancel();
  //   return make_it_id;
  // });
   make_it_id=await getRandomNumber(make_it_list,geoLocation);
   result(null,make_it_id)
}

async function getRandomNumber(make_it_id,geoLocation) {
  var filterarray=[]
  await Promise.all(make_it_id.map(async function(item){
    await geoFire.get(""+item.userid).then(function(location) {
      if (location === null) {
        console.log("Provided key is not in GeoFire");
        item.islocation=false;
        item.distance=0;
      }else{
        var dist = geodist(geoLocation, location,{exact: true, unit: 'km'});
        console.log("Provided key has a location of " +geoLocation);
        item.distance= dist.toFixed(2);//new geoFires.GeoFire.distance(location1,location2);
        item.location= location;
        item.islocation=true;
       
      }
    }, function(error) {
      console.log("Error: " + error);
      item.islocation=false;
      item.distance=0;
    });
    // await firebaseRef.child(item).once('value').then(function(snapshot) {
    //     console.log(snapshot.val().online_status + "username at order_status--"+snapshot.val().order_status);
    //     if(snapshot.val().online_status===1&&snapshot.val().order_status===0)
    //     filterarray.push(item)
    //     console.log("make_it_id--",filterarray)
    //   });
    }))
    console.log("make-it--->",make_it_id);
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
  console.log("token moveit:-"+token);
  var payload = {
    data: dat
  };
  console.log("payload:"+payload.data.title);
  Move_it.messaging().sendToDevice(token, payload, options);
};