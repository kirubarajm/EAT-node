var FCM = require('fcm-node');
    var serverKey = require('./tovologies-1550475998119-firebase-adminsdk-jra7a-00656defb2.json'); //put your server key here
    var fcm = new FCM(serverKey);
 
exports.sendSingleNotification = function(token,title,body) {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: token, 
        //collapse_key: 'your_collapse_key',
        
        notification: {
            title: title, 
            body: body 
        },
        
        data: {  //you can send only notification or only data(or include both)
            title: title, 
            body: body,
            page_id:'1',
            app:'Move-it' 
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!--"+err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

