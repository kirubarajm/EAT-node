'user strict';


const calculate = {
  gst: 5, // percentage
  food_gst: 5, // percentage
  food_commission_cost: 18,
  deliverycharge: 0, // cost made changes 10-jan-2020
  applink: "http://bit.ly/2ZcGL95",
  iosapplink: "https://apple.co/2lna3n9",
  refferalcontent:"Welcome to EAT. Click the link to download the EAT app from play store",
  radiuslimit: 2.37,
  foodpreparationtime: 15, //min
  onekm: 10,
  servicecharge: 0,
  cancellationmessage: "Are you sure! you want to cancel the order?",
  makeit_nearby_moveit_radius: 4, // in kilometers
  eatversioncodenew: 7, //normal update
  eatversionforceupdate: 7, //forceupdate version
  eatforceupdate: 1,
  eat_delivery_min: 60,
  product_commission_percentage: 50, // percentage
  breatfastcycle: 8, //8 -12
  lunchcycle: 12, //12 - 4
  dinnercycle: 16, //4 - 11
  dinnerend: 22,
  dinnerstart: 4,
  max_order_rating_skip: 2,
  tunnel_refund_amout: 100,
  //  moveitversioncode : 1,
  moveitversioncodenew: 7, //normal update
  moveitversionforceupdate: 7, //forceupdate version
  moveitforceupdate: 7,

  makeitversioncodenew: 4, //normal update
  makeitversionforceupdate: 4, //forceupdate version
  makeitforceupdate: 1,

  salesversioncodenew: 2, //normal update
  salesversionforceupdate: 2, //forceupdate version
  salesforceupdate: 1,

  eatiosversioncodenew: 1, //normal update
  eatiosversionforceupdate: 1, //forceupdate version
  eatforceupdate: 1,

  distanceapiKey: "AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc",
  orderbuffertime: 10, //min

  customer_support: 7358531315,
  //Moveit Support Number
  moveit_customer_support: 7358531315,
  //Sales Support Number
  sales_customer_support: 7358531315,
  //support number
  makeit_customer_support: 7358531315,

  //Live Razorpay Details
  razorpay_key_id: "rzp_live_bCMW6sG1GWp36Q",
  razorpay_key_secret: "2VAma7EVApDnLuOMerwX3ODu",

  //Test Razorpay Details
  //razorpay_key_id: "rzp_test_3cduMl5T89iR9G",
  //razorpay_key_secret: "BSdpKV1M07sH9cucL5uzVnol",

  Xfactor_value:1.9,
  Xfactor_subtraction_value:1,
  
    //Auto assign Radius limit  2km  - 3km
    //miles 1.24 to 1.87
    nearby_moveit_radius: 1.87,

    //Miles to km
    onemile : 1.6,

    order_assign_status:true,

    //Hub circle radius 3 km.
    hub_radius:3,

    
    // ///Dunzo Authorization
    // order_assign_dunzo:false,

    // order_assign_dunzo_waiting_min:3,
    // dunzo_client_id : "c6c3acd5-e254-4404-ad06-c0c1d2aafd1e",
    // Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkIjp7InJvbGUiOjEwMCwidWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1In0sIm1lcmNoYW50X3R5cGUiOm51bGwsImNsaWVudF9pZCI6ImM2YzNhY2Q1LWUyNTQtNDQwNC1hZDA2LWMwYzFkMmFhZmQxZSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwibmFtZSI6IkFQSVVTRVIiLCJ1dWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1Iiwicm9sZSI6MTAwLCJkdW56b19rZXkiOiIwNmRkZGU1Yy1jODlkLTRiZjgtYjBhMi0wY2Q3NWE2NTVkYWQiLCJleHAiOjE3Mjk2NjUzNDksInYiOjAsImlhdCI6MTU3NDE0NTM0OSwic2VjcmV0X2tleSI6Ik5vbmUifQ.iOvx9-J_0hpD859q2jGuJUMJ_GLdR3RVkB6tFGgeusw",

    //Zone Controles
    zone_control:true,

    //kitchen pagenation 
     kitchen_pagenation_limit :5,

     //dunzo zone order limit 
     Dunzo_zone_order_limit:10,
    ///dunzo max req to generate task id
     Dunzo_max_req:10,

     makeit_applink: "http://bit.ly/2Em3K9T",
     makeit_iosapplink: "https://apple.co/2lna3n9",
     makeit_refferalcontent:"Welcome to EAT Kitchen. Click the link to download the EAT app from play store",
    
    order_cover_package_id :1,
    
    interval_days : 3,

    //////////////Infinity/////////////
    infinity_kitchen_page_limit:5,
    infinity_repeat_switch_loop:2,    
    infinity_first_collection_details_cid:24,
    cart_demand_value:70, /// ruppes
    minimum_cart_value:30,
    home_gst:18,//%
    cater_gst:5,
    convenience_charge:20,
    convenience_charge_status:false,
    product_cost_limit_message:"We are sorry. We can't process this order. Kindly order above the minimun cart value of Rs.30 to proceed.",
    product_cost_limit_short_message:"Minimum cart value is Rs.",
    Makeit_monthly_expect_earning :10000,


    /////////////Makit Incentive///////////////
    logtime_percentage :75,
    makeit_tier1:500,
    makeit_tier2:750,
    makeit_tier3:1000,

    ////////////////Moveit Cycle time//////////
    cycle1:4,
    cycle2:4,
    cycle3:7,

}



module.exports = calculate;