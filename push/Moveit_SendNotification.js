const firebase = require("firebase-admin");
var MoveitserverKey = require("../moveit-a9128-firebase-adminsdk-3h0b8-6315acfc79.json");
var Move_it = null;

function initializeAppName() {
  if (!Move_it) {
    Move_it = firebase.initializeApp(
      {
        credential: firebase.credential.cert(MoveitserverKey),
        databaseURL: "https://move-it-app.firebaseio.com/"
      },
      "move-it-app"
    );
  }else{
    console.log("Move_it name--->" + Move_it.name);
  }
};

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