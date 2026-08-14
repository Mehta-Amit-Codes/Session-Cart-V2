const express = require('express');
const passport = require('passport');
const { doubleCsrfProtection, generateToken } = require('../config/csrf');
const router = express.Router();

router.use(doubleCsrfProtection);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('user/profile', { user: req.user.toObject() });
});

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.get('/signup', notLoggedIn, (req, res) => {
  const message = req.flash('error');
  res.render('user/signup', {
    csrfToken: generateToken(req, res, { overwrite: true }),
    message,
    hasErrors: message.length > 0,
  });
});

router.post(
  '/signup',
  notLoggedIn,
  passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true,
  })
);

router.get('/signin', notLoggedIn, (req, res) => {
  const message = req.flash('error');
  res.render('user/signin', {
    csrfToken: generateToken(req, res, { overwrite: true }),
    message,
    hasErrors: message.length > 0,
  });
});

router.post(
  '/signin',
  notLoggedIn,
  passport.authenticate('local.signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true,
  })
);

module.exports = router;