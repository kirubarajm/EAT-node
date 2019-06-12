'user strict';

// makeit appointment status 

const master = [

    {
        'regionlist': [{
                "regionid": 1,
                "regionname": "Tamil nadu"
            },
            {
                "regionid": 2,
                "regionname": "Kerala specialist"
            },
            {
                "regionid": 3,
                "regionname": "punjabi"
            }
        ]
    },

    {
        'cuisinelist': [{
                "cuisineid": 1,
                "cuisinename": "Continental"
            },
            {
                "cuisineid": 2,
                "cuisinename": "South Indian"
            },
            {
                "cuisineid": 3,
                "cuisinename": "North Indian"
            },
            {
                "cuisineid": 4,
                "cuisinename": "Itallian"
            }
        ]
    },

    {
        'sort': [{
                "sortid": 1,
                "sortname": "Nearest"
            },
            {
                "sortid": 2,
                "sortname": "Top rated"
            },
            {
                "sortid": 3,
                "sortname": "low to high"
            },
            {
                "sortid": 4,
                "sortname": "high to low"
            },
        ]
    },


    {
        'makeitregistrationStatus': [{
                "registrationStatusid": 0,
                "registrationStatus": "Registration"
            },

            {
                "registrationStatusid": 1,
                "registrationStatus": "Makeit Appoinment"
            },
            {
                "registrationStatusid": 2,
                "registrationStatus": "Sales Assign"
            },
            {
                "registrationStatusid": 3,
                "registrationStatus": "Sales Approval"
            },
            {
                "registrationStatusid": 4,
                "registrationStatus": "Admin Approval"
            }
        ]
    },



    // Food Cycle for product 0 is disable 1 is enable for food cycle
    {
        'foodcycle': [{
                "foodcycleStatusid": 1,
                "foodcycle": "Breakfast",
                "foodtime": " 7 to 12",
            },
            {
                "foodcycleStatusid": 2,
                "foodcycle": "Lunch",
                "foodtime": "12 to 4",
            },
            {
                "foodcycleStatusid": 3,
                "foodcycle": "Dinner",
                "foodtime": "6 to 11",
            }
        ]
    },


    // // Sales for followupstatus
    //  {'salesfollowupstatus' : [
    //     {
    //         "followupstatussid":0,
    //         "followupstatus":"incomplete"
    // },
    //     {
    //         "followupstatussid":1,
    //         "followupstatus":"complete"
    //     }
    // ]},


    // Sales for followupstatus
    {
        'salesfollowupstatus': [{
                "followupstatussid": 0,
                "followupstatus": "incomplete"
            },
            {
                "followupstatussid": 1,
                "followupstatus": "complete"
            },
            {
                "followupstatussid": 2,
                "followupstatus": "info-schedule"
            },
            {
                "followupstatussid": 3,
                "followupstatus": "info-reschedule"
            },
            {
                "followupstatussid": 4,
                "followupstatus": "appointment-schedule"
            },

            {
                "followupstatussid": 5,
                "followupstatus": "appointment-reschedule"
            }
        ]
    },


    // order status
    {
        'OrderStatus': [{
                "OrderStatusid": 0,
                "OrderStatus": "orderput"
            },
            {
                "OrderStatusid": 1,
                "OrderStatus": "orderAccept"
            },
            {
                "OrderStatusid": 2,
                "OrderStatus": "orderPreparing"
            },
            {
                "OrderStatusid": 3,
                "OrderStatus": "orderPrepared"
            }, //orderPacked
            // "OrderStatusid":4,"OrderStatus":"kitchen reached",
            {
                "OrderStatusid": 5,
                "OrderStatus": "orderPickedup"
            },
            {
                "OrderStatusid": 6,
                "OrderStatus": "orderDelivered"
            }
        ]
    },

    //order payment type
    {
        'paymenttype': [{
                "paymenttypeid": 0,
                "paymenttype": "cashOnDelivery"
            },
            {
                "paymenttypeid": 1,
                "paymenttype": "netBanking"
            }

        ]
    },

    //order payment status
    {
        'paymentstatus': [{
                "paymentstatusid": 0,
                "paymentstatus": "not paid"
            },
            {
                "paymentstatusid": 1,
                "paymentstatus": "paid"
            }

        ]
    },

    //order user type
    {
        'ordertype': [{
                "ordertypeid": 0,
                "ordertype": "eatuser"
            },
            {
                "ordertypeid": 1,
                "ordertype": "virtual"
            }
        ]
    },

    //product move to live
    {
        'liveproductstatus': [{
                "active_statusid": 0,
                "active_status": "removelivepeoduct"
            },
            {
                "active_statusid": 1,
                "active_status": "movelivepeoduct"
            }
        ]
    },

    // food type
    {
        'foodtype': [{
                "vegtypeid": 0,
                "vegtype": "veg"
            },
            {
                "vegtypeid": 1,
                "vegtype": "non-veg"
            }
        ]
    },

    // user type
    {
        'usertype': [{
                "usertypeid": 0,
                "usertype": "user"
            },
            {
                "usertypeid": 1,
                "usertype": "virtual_user"
            },
        ]
    },

    // image upload type 
    {
        'documenttypemakeit': [{
                "documenttypeid": 1,
                "documenttype": "Kitchen image"
            },
            {
                "documenttypeid": 2,
                "documenttype": "Kitchen Appliances"
            },
            {
                "documenttypeid": 3,
                "documenttype": "Identification document"
            },
            {
                "documenttypeid": 4,
                "documenttype": "Address proof"
            },
            {
                "documenttypeid": 5,
                "documenttype": "Signature image"
            },
        ]
    },

    // sales move online 
    {
        'moveonlinestatus': [{
                "moveonlinestatusid": 0,
                "moveonlinestatus": "offline"
            },
            {
                "moveonlinestatusid": 1,
                "moveonlinestatus": "online"
            },
        ]
    },

    // order payment status
    {
        'paymentstatus': [{
                "paymentstatusid": 0,
                "paymentstatus": "Paymemt Pending"
            },
            {
                "paymentstatusid": 1,
                "paymentstatus": "Paymemt paid"
            },
            {
                "paymentstatusid": 2,
                "paymentstatus": "Payment failed"
            },
            {
                "paymentstatusid": 3,
                "paymentstatus": "Refunded"
            },
            {
                "paymentstatusid": 4,
                "paymentstatus": "Declined"
            },
            {
                "paymentstatusid": 5,
                "paymentstatus": "Paymemt Incomplete"
            },

        ]
    },

    // order pick up quality check
    {
        'qualitycheck': [{
                "id": 1,
                "description": 'Hot Food Received'
            },
            {
                "id": 2,
                "description": 'Food Packaging'
            },
            {
                "id": 3,
                "description": 'Food Preparation Time'
            },
            {
                "id": 4,
                "description": 'product'
            }
        ]
    },

    // order pick up quality check
    {
        'qualitycheckenabletype': [{
                "id": 0,
                "description": 'not ok'
            },
            {
                "id": 1,
                "description": 'ok'
            }
        ]
    },

    {
        'addresstype': [{
                "addresstypeid": 1,
                "description": 'Home'
            },
            {
                "addresstypeid": 2,
                "description": 'work'
            },
            {
                "addresstypeid": 3,
                "description": 'others'
            },
        ]
    },

    {
        'appuserstype': [{
                "addresstypeid": 0,
                "description": 'admin'
            },
            {
                "addresstypeid": 1,
                "description": 'makeit'
            },
            {
                "addresstypeid": 2,
                "description": 'moveit'
            },
            {
                "addresstypeid": 3,
                "description": 'sales'
            },
            {
                "addresstypeid": 4,
                "description": 'eat'
            },

        ]
    },

    {
        'gender': [{
                "genderid": 1,
                "gendername": "Male"
            },
            {
                "genderid": 2,
                "gendername": "Female"
            },
            {
                "genderid": 3,
                "gendername": "Others"
            }
        ]
    },

    {
        'productapprovestatus': [{
                "statusid": 0,
                "description": "new peoduct"
            },
            {
                "statusid": 1,
                "description": "Product accept"
            },
            {
                "statusid": 2,
                "description": "product reject"
            },
            {
                "statusid": 3,
                "description": "product edit"
            }
        ]
    },

    {
        'quicksearch': [{
                "quicksearchid": 1,
                "quicksearchtype": 'Product'
            },
            {
                "quicksearchid": 2,
                "quicksearchtype": 'kitchen'
            },
            {
                "quicksearchid": 3,
                "quicksearchtype": 'others'
            }
        ]
    },

    {
        'boxingtype': [{
                "boxingtypeid": 1,
                "description": "Small Boxes"
            },
            {
                "boxingtypeid": 2,
                "description": "Medium Boxes"
            },
            {
                "boxingtypeid": 3,
                "description": "Large Boxes"
            },
            {
                "boxingtypeid": 4,
                "description": "Outer Boxes"
            }
        ]
    },

]
module.exports = master;