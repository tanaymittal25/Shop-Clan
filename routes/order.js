const router = require('express').Router();
const Gig = require('../models/gig');
const Order = require('../models/order');

const fee = 3.15;

router.get('/checkout/single_package/:id', (req, res, next) => {
    Gig.findOne({ _id: req.params.id }, function(err, gig) {
        var totalPrice = gig.price + fee;
        req.session.gig = gig;
        req.session.price = totalPrice;
        res.render('checkout/single_package', { gig: gig, totalPrice: totalPrice});
    });
});

router.route('/confirm')
.get((req, res, next) => {
  res.render("checkout/confirm");
})
.post((req, res, next) => {
    var gig = req.session.gig;
    var price = req.session.price;
    var order = new Order();
    order.buyer = req.user._id;
    order.seller = gig.owner;
    order.gig = gig._id;
    order.save(function(err) {
      req.session.gig = null;
      req.session.price = null;
      res.redirect('/users/' + req.user._id + '/orders/' + order._id);
    });
});

router.get('/users/:userId/orders/:orderId', (req,res,next) =>{
  req.session.orderId = req.params.orderId;
  Order.findOne({ _id: req.params.orderId})
    .populate('buyer')
    .populate('seller')
    .populate('gig')
    .deepPopulate('messages.owner')
    .exec(function(err, order){
      res.render('order/order-room', {layout: 'chat_layout' , order: order, helpers: {
        if_equals: function(a,b,opts) {
          if(a.equals(b)) {
            return opts.fn(this);
          } else {
            return opts.inverse(this);
          }
        }
      }});
    });
});

router.get('/users/:id/manage-orders', (req, res, next) => {
  Order.find({ seller: req.user._id })
    .populate('buyer')
    .populate('seller')
    .populate('gig')
    .exec(function(err, orders){
      res.render('order/order-seller', { orders: orders});
    });
});

router.get('/users/:id/orders', (req, res, next) => {
  Order.find({ buyer: req.user._id})
    .populate('buyer')
    .populate('selles')
    .populate('gig')
    .exec(function(err,orders){
      res.render('order/order-buyer', {orders: orders});
    });
});

router.post('/add-to-cart', (req, res, next) => {
  const gigId = req.body.gig_id;
  User.update(
    {
      _id: req.user._id
    },
    {
      $push: {cart: gigId}
    }, function(err,count) {
      res.json("Added to cart");
    }
  );
});

module.exports = router;