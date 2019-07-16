"use strict";
module.exports = function(app) {
var routesVersioning = require('express-routes-versioning')();
  var eatuser = require("../controllers/eat/EatUserController");
  var makeituser = require("../controllers/makeit/MakeitUserController");
  var fav = require("../controllers/eat/FavController");
  var orders = require("../controllers/common/OrderController");
  var eatuseraddress = require("../controllers/eat/EatUserAddressController");
  var orderrating = require("../controllers/common/OrderratingController");
  var quicksearch = require("../controllers/common/QuickSearchController");
  var refundcoupon = require("../controllers/common/RefundCouponController");
  var coupon = require("../controllers/common/CouponController");
  var Stories = require("../controllers/common/StoryController");
  var feedback = require("../controllers/common/EatfeedbackController");

// Eat
app.route("/eat/products").post(routesVersioning({"1.0.0": eatuser.eat_makeit_product_list}));
app.route("/eat/placeorder").post(routesVersioning({"1.0.0":orders.eatuser_order_create}));
app.route("/eat/order/:orderid").get(routesVersioning({"1.0.0":orders.order_view_eatuser}));
app.route("/eat/orders/:userid").get(routesVersioning({"1.0.0":orders.order_list_eatuser}));
app.route("/eat/address").get(routesVersioning({"1.0.0":eatuseraddress.list_all_address})).post(routesVersioning({"1.0.0":eatuseraddress.create_a_address}));
app.route("/eat/address/:userid").get(routesVersioning({"1.0.0":eatuseraddress.read_a_user_address_userid})).delete(routesVersioning({"1.0.0":eatuseraddress.delete_a_user_address}));
app.route("/eat/addresslist/:aid").get(routesVersioning({"1.0.0":eatuseraddress.read_a_user_address_aid}));
app.route("/eat/address/").put(routesVersioning({"1.0.0":eatuseraddress.update_a_user_address}));
app.route("/eat/addressdelete").put(routesVersioning({"1.0.0":eatuseraddress.update_delete_status}));
app.route("/eat/makeituser/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user}));
app.route("/eat/order/add").post(routesVersioning({"1.0.0":orders.eatcreateOrder}));
app.route("/eat/orderplace").post(routesVersioning({"1.0.0":orders.online_order_place_conformation}));
app.route("/eat/cartdetails").post(routesVersioning({"1.0.0":makeituser.read_a_cartdetails}));
app.route("/eat/dishlist").post(routesVersioning({"1.0.0":eatuser.eat_dish_sort_filter}));
app.route("/eat/kitchenlist").post(routesVersioning({"1.0.0":eatuser.eat_kitchen_sort_filter}));
app.route("/eat/fav").post(routesVersioning({"1.0.0":fav.create_a_fav}));
app.route("/eat/fav/:id").delete(routesVersioning({"1.0.0":fav.delete_a_fav}));
app.route("/eat/fav/dishlist/:id").get(routesVersioning({"1.0.0":fav.read_a_fav_dishlist}));
app.route("/eat/fav/kitchenlist/:id").get(routesVersioning({"1.0.0":fav.read_a_fav_kitchenlist}));
app.route("/eat/liveorders/:userid").get(routesVersioning({"1.0.0":orders.live_order_list_byeatuser}));
app.route("/eat/proceedtopay").post(routesVersioning({"1.0.0":orders.read_a_proceed_to_pay}));
app.route("/eat/referral/:userid").get(routesVersioning({"1.0.0":eatuser.eat_user_referral}));
app.route("/eat/login").post(routesVersioning({"1.0.0":eatuser.eatuser_login}));
app.route("/eat/otpverification").post(routesVersioning({"1.0.0":eatuser.eatuser_otpverification}));
app.route("/eat/edit").put(routesVersioning({"1.0.0":eatuser.edit_eat_users}));
app.route("/eat/feedback").get(routesVersioning({"1.0.0":feedback.list_all_feedback})).post(routesVersioning({"1.0.0":feedback.create_a_feedback}));
app.route("/eat/checklogin").post(routesVersioning({"1.0.0":eatuser.checklogin}));
app.route("/eat/postregistration").put(routesVersioning({"1.0.0":eatuser.eat_user_post_registration}));
app.route("/eat/forgot").post(routesVersioning({"1.0.0":eatuser.eat_user_forgot_password}));
app.route("/eat/password").put(routesVersioning({"1.0.0":eatuser.eat_user_forgot_password_update}));
app.route("/eat/rating").post(routesVersioning({"1.0.0":orderrating.createorderrating}));
app.route("/eat/pushid/add").put(routesVersioning({"1.0.0":eatuser.add_a_pushid}));
app.route("/eat/defaultaddress").put(routesVersioning({"1.0.0":eatuseraddress.eat_user_default_address_update}));
app.route("/eat/payment/customerid").get(routesVersioning({"1.0.0":eatuser.create_customerid_by_razorpay}));
app.route("/eat/region/kitchenlist").post(routesVersioning({"1.0.0":eatuser.eat_region_list_sort_filter}));
app.route("/eat/regionlist").post(routesVersioning({"2.0.0": eatuser.eat_region_list2,"1.0.0": eatuser.eat_region_list}));
app.route("/eat/kitche/showmore").post(routesVersioning({"1.0.0":eatuser.eat_region_kitchen_showmore}));
app.route("/eat/product/search").post(routesVersioning({"1.0.0":eatuser.eat_explore_dish}));
app.route("/eat/explore").get(routesVersioning({"1.0.0":quicksearch.eat_explore_store_data}));
app.route("/eat/quicksearch").post(routesVersioning({"1.0.0":quicksearch.eat_explore_quick_search}));
app.route("/eat/order/cancel").put(routesVersioning({"1.0.0":orders.eat_order_cancel}));
app.route("/eat/refund/:userid").get(routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));
app.route("/eat/refundupdate").put(routesVersioning({"1.0.0":refundcoupon.updateByRefundCouponId}));
app.route("/eat/stories").get(routesVersioning({"1.0.0":Stories.list_all_Stories}));
app.route("/eat/order/refund/getlastcoupon/:userid").get(routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));
app.route("/eatusers").get(routesVersioning({"1.0.0":eatuser.list_all_eatuser})).post(routesVersioning({"1.0.0":eatuser.create_a_eatuser}));
app.route("/eatusers/:userid").get(routesVersioning({"1.0.0":eatuser.read_a_user})).put(routesVersioning({"1.0.0":eatuser.update_a_user}));
app.route("/favforeatusers/:id").get(routesVersioning({"1.0.0":fav.list_all_fav_eatusers}));
app
    .route("/fav")
    .get(routesVersioning({"1.0.0":fav.list_all_fav}))
    .post(routesVersioning({"1.0.0":fav.create_a_fav}));

  app.route("/fav/:id")
    .get(routesVersioning({"1.0.0":fav.read_a_fav}))
    .put(routesVersioning({"1.0.0":fav.update_a_fav}))
    .delete(routesVersioning({"1.0.0":fav.delete_a_fav}));

  app.route("/orders/ordercreate").post(routesVersioning({"1.0.0":orders.eatuser_order_create})).delete(routesVersioning({"1.0.0":eatuser.delete_a_user}));

app.route("/eat/coupon/:userid").get(routesVersioning({"1.0.0":coupon.get_all_coupons_by_userid}));
}