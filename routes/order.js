const router = require('express').Router();
const Gig = require('../models/gig');
const stripe = require('stripe')('sk_test_GGR8N0YIqobzHkcnF0d1keo0');

const fee = 3.15;

router.get('/checkout/single_package/:id', (req, res, next) => {
    Gig.findOne({ _id: req.params.id }, function(err, gig) {
        var totalPrice = gig.price + fee;
        req.session.gig = gig;
        req.session.price = totalPrice;
        res.render('checkout/single_package', { gig: gig, totalPrice: totalPrice});
    });
});

router.route('/payment')
.get((req, res, next) => {
  res.render('checkout/payment');
})
.post((req, res, next) => {
  var gig = req.session.gig;
  var price = req.session.price;
  price *= 100;
  stripe.customers.create({
    email: req.user.email
  }).then(function(customer){
    return stripe.customers.createSource(customer.id, {
      source: req.body.stripeToken
    });
  }).then(function(source) {
    return stripe.charges.create({
      amount: price,
      currency: 'usd',
      customer: source.customer
    });
  }).then(function(charge) {
    // DO SOMETHING
    var order = new Order();
    order.buyer = req.user._id;
    order.seller = gig.owner;
    order.gig = gig._id;
    order.save(function(err) {
      req.session.gig = null;
      req.session.price = null;
      res.redirect('/users/' + req.user._id + '/orders/' + order._id);
    });
  }).catch(function(err) {
    // Deal with an error
  });
});


module.exports = router;