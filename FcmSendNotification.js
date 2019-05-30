var FCM = require("fcm-node");
var serverKey = require("./tovologies-1550475998119-firebase-adminsdk-jra7a-00656defb2.json"); //put your server key here
var fcm = new FCM(serverKey);

exports.sendSingleNotification = function(token, title, message,userdetail) {
  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: token,
    //collapse_key: 'your_collapse_key',

    // notification: {
    //   title: title,
    //   body: message
    // },

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

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

exports.sendOrderNotificationAndroid = function(token, title, message) {
  var message = {
    to: token,

    notification: {
      title: title,
      body: message
    },

    data: {
      title: title,
      message: message,
      page_id: "1",
      notification_type: "1"
    }
  };

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

exports.sendImageNotificationAndroid = function(token, title, message, image) {
  var message = {
    to: token,

    data: {
      title: title,
      message: message,
      page_id: "1",
      notification_type: 3,
      image: image
    }
  };

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

exports.sendBigTextNotificationAndroid = function(token, title, message) {
  var message = {
    to: token,

    data: {
      title: title,
      message: message,
      page_id: "1",
      notification_type: 2,
      image: image
    }
  };

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

exports.sendUpdateNotificationAndroid = function(token, title, message) {
  var message = {
    to: token,

    data: {
      title: title,
      message: message,
      page_id: "0",
      notification_type: 1
    }
  };

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

exports.sendUpdateNotificationIOS = function(token, title, message) {
  var message = {
    to: token,

    data: {
      title: title,
      message: message,
      page_id: "0",
      notification_type: 1
    }
  };

  fcm.send(message, function(err, response) {
    if (err) {
      console.log("Something has gone wrong!--" + err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};
