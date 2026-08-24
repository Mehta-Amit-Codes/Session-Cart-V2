const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
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

// State-changing: now POST instead of GET
router.post('/add-to-cart/:id', async (req, res, next) => {
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
  res.render('shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    csrfToken: generateToken(req, res, { overwrite: true }),
  });
});

// State-changing: now POST instead of GET
router.post('/reduce/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// New: remove-all-cart endpoint (previously a UI placeholder with no backend route)
router.post('/remove-all-from-cart', (req, res) => {
  req.session.cart = null;
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

router.post('/checkout', isLoggedIn, doubleCsrfProtection, async (req, res, next) => {
  try {
    if (!req.session.cart) {
      return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    if (cart.totalQty === 0) {
      return res.redirect('/shopping-cart');
    }

    const items = cart.generateArray().map((entry) => ({
      productId: entry.item.id,
      title: entry.item.title,
      price: entry.item.price,
      qty: entry.qty,
    }));

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice: cart.totalPrice,
      status: 'confirmed',
    });

    req.session.cart = null;
    res.redirect(`/order-confirmation/${order._id}`);
  } catch (err) {
    next(err);
  }
});

// New: order confirmation page, scoped to the owning user only
router.get('/order-confirmation/:id', isLoggedIn, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) {
      return res.redirect('/');
    }
    res.render('order-confirmation', { order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;