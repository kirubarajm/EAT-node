const firebase = require("firebase-admin");
var AdminserverKey = require("../eat-admin-firebase-adminsdk-znfbj-1be0493d85.json");
var Admin = null;

function initializeAppName() {
  if (!Admin) {
    Admin=firebase.initializeApp(
      {
        credential: firebase.credential.cert(AdminserverKey),
        databaseURL: "https://eat-admin.firebaseio.com"
      },
      "eat-admin"
    );
  } else{
    console.log("Sales name--->" + Admin.name);
  }
};

exports.sendNotificationWEB = function(
  token,
  dat,
) {
 initializeAppName();
 console.log("token-->",token);
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
  
  // Send a message to the device corresponding to the provided
  // registration token.
  Admin.messaging().sendToDevice(token, payload, options)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
};

