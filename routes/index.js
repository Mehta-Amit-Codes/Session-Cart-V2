const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { doubleCsrfProtection, generateToken } = require('../config/csrf');
const router = express.Router();

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/user/signin');
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const docs = await Product.find().lean();
    const chunkSize = 3;
    const productChunks = [];
    for (let i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('index', { title: 'Shopping Cart', products: productChunks });
  } catch (err) {
    next(err);
  }
});

router.get('/add-to-cart/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : { items: {} });

    const product = await Product.findOne({ id: productId }).lean();
    if (!product) {
      return res.redirect('/');
    }

    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/shopping-cart', (req, res) => {
  if (!req.session.cart) {
    return res.render('shopping-cart', { products: null });
  }
  const cart = new Cart(req.session.cart);
  res.render('shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/reduce/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/checkout', isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);
  res.render('checkout', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    csrfToken: generateToken(req, res, { overwrite: true }),
  });
});

router.post('/checkout', isLoggedIn, doubleCsrfProtection, (req, res) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  // TODO: persist the order, clear the cart, and render a confirmation page.
  req.session.cart = null;
  res.redirect('/');
});

module.exports = router;