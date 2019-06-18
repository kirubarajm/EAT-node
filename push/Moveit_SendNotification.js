const firebase = require("firebase-admin");
var MoveitserverKey = require("../moveit-a9128-firebase-adminsdk-3h0b8-6315acfc79.json");
var Move_it = null;

exports.initializeAppName = function() {
  
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

exports.sendSingleNotification = function(token, title, message,userdetail) {
  exports.initializeAppName();
  const payload = {
    data: {
      title: title,
      message: message,
      name:""+userdetail.name,
      price:""+userdetail.price,
      orderid:""+userdetail.orderid,
      place:""+userdetail.place,
      page_id: "1",
      app: "Move-it",
      notification_type: "1"
    }
  };
 
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24, // 1 day
  };
  Move_it.messaging().sendToDevice(token, payload, options);
};

exports.sendMoveitOrderAssignNotification = function(token, payload) {
  exports.initializeAppName();
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24, // 1 day
  };
  Move_it.messaging().sendToDevice(token, payload, options);
};

exports.sendMakeitOrderPostNotification = function(token, makeit_data) {
  exports.initializeAppName();
  console.log("push_data---"+makeit_data);
  const payload ={
    data:makeit_data
  }
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24, // 1 day
  };
  Move_it.messaging().sendToDevice(token, payload, options);
};