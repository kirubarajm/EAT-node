const firebase = require("firebase-admin");
var EatserverKey = require("./eat-app-9c47f-firebase-adminsdk-dgp75-7c570f4349.json");
var EAT = null;

exports.initializeAppName = function() {
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

exports.sendOrderNotificationAndroid = function(
  token,
  title,
  message,page_id
) {
  exports.initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };

  var payload = {
    data: {
      title: title,
      message: message,
      pageid: ""+page_id,
      notification_type: "1"
    }
  };
  EAT.messaging().sendToDevice(token, payload, options);
};

// exports.sendImageNotificationAndroid = function(token, title, message, image) {

//   var message = {
//     to: token,

//     data: {
//       title: title,
//       message: message,
//       page_id: "1",
//       notification_type: "3",
//       image: image
//     }
//   };

//   fcm.send(message, function(err, response) {
//     if (err) {
//       console.log("Something has gone wrong!--" + err);
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// };

// exports.sendBigTextNotificationAndroid = function(token, title, message) {
//   var message = {
//     to: token,

//     data: {
//       title: title,
//       message: message,
//       page_id: "1",
//       notification_type: "2",
//       image: image
//     }
//   };

//   fcm.send(message, function(err, response) {
//     if (err) {
//       console.log("Something has gone wrong!--" + err);
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// };

// exports.sendUpdateNotificationAndroid = function(token, title, message) {
//   var message = {
//     to: token,

//     data: {
//       title: title,
//       message: message,
//       page_id: "0",
//       notification_type: 1
//     }
//   };

//   fcm.send(message, function(err, response) {
//     if (err) {
//       console.log("Something has gone wrong!--" + err);
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// };

// exports.sendUpdateNotificationIOS = function(token, title, message) {
//   var message = {
//     to: token,

//     data: {
//       title: title,
//       message: message,
//       page_id: "0",
//       notification_type: 1
//     }
//   };

//   fcm.send(message, function(err, response) {
//     if (err) {
//       console.log("Something has gone wrong!--" + err);
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// };
