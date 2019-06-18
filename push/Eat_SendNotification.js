const firebase = require("firebase-admin");
var EatserverKey = require("../eat-app-9c47f-firebase-adminsdk-dgp75-7c570f4349.json");
var EAT = null;

function initializeAppName () {
  if (!EAT) {
    EAT=firebase.initializeApp(
      {
        credential: firebase.credential.cert(EatserverKey),
        databaseURL: "https://eat-app.firebaseio.com"
      },
      "eat-app"
    );
  } else{
    console.log("EAT name--->" + EAT.name);
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

  var payload = {
    data: dat
  };
  EAT.messaging().sendToDevice(token, payload, options);
};
