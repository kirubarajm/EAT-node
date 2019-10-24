'user strict';


const calculate = {
    gst     : 5,// percentage
    food_gst     : 5,// percentage
    food_commission_cost : 18,
    deliverycharge : 0,// cost
    applink :'http://bit.ly/2ZcGL95',
    iosapplink : 'https://apple.co/2lna3n9',
    refferalcontent : 'Welcome to EAT. Click the link to download the EAT app from play store.',
    radiuslimit : 2.5,
    foodpreparationtime:15,//min
    onekm:10,// one km per 10 min
    servicecharge:0,
    cancellationmessage : "Are you sure! you want to cancel the order?",
    makeit_nearby_moveit_radius:4, // in kilometers
    eat_delivery_min:60,
    product_commission_percentage : 50,// percentage 20 has changed 50
    breatfastcycle : 8,//8 -12
    lunchcycle : 12,//12 - 4
    dinnercycle : 16 ,//4 - 11
    dinnerend : 22,
    dinnerstart : 4,
    max_order_rating_skip : 2,
    tunnel_refund_amout : 100,

    //eat version
    eatversioncodenew : 7,//normal update
    eatversionforceupdate : 7, //forceupdate version
    eatforceupdate : 7,

  //  moveitversioncode : 1,
    moveitversioncodenew : 7,//normal update
    moveitversionforceupdate : 7, //forceupdate version
    moveitforceupdate : 7, 

    makeitversioncodenew : 4,//normal update
    makeitversionforceupdate : 4, //forceupdate version
    makeitforceupdate : 1, 

    salesversioncodenew : 2,//normal update
    salesversionforceupdate : 2, //forceupdate version
    salesforceupdate : 1, 

    eatiosversioncodenew : 1,//normal update
    eatiosversionforceupdate : 1, //forceupdate version
    eatforceupdate : 1,

    distanceapiKey :'AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc',
    orderbuffertime :10, //min

  //support number
    customer_support :7358531315,
   //support number
    makeit_customer_support :7358531315,

  //Razorpay Details
    razorpay_key_id : 'rzp_live_bCMW6sG1GWp36Q',
    razorpay_key_secret : '2VAma7EVApDnLuOMerwX3ODu',

  //Radius limit  2km
  nearby_moveit_radius: 2,

  //Miles to km
  onemile : 1.6,
}




module.exports = calculate;