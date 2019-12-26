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
 // dat.content_available = '1';
  var payload = {
    data: dat,
    notification: {
      title: dat.title,
      body: dat.message, // <= CHANGE
      sound : "default"
    }
  };
  console.log("token-->",token+""+payload.data);
  EAT.messaging().sendToDevice(token, payload, options)
  .then(Response => {
    

    console.log(Response);
      // var new_responce= new Eat_notification_responce(Response);
      //  new_responce.userid=dat.userid;

   //   Eat_notification_responce.createEat_notification_responce(new_responce);
  
 
  })

  .catch(err => {
    console.log(err);
  });
};
