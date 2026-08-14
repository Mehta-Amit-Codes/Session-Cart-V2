const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { body, validationResult } = require('express-validator');

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

async function runValidation(req, rules) {
  await Promise.all(rules.map((rule) => rule.run(req)));
  const result = validationResult(req);
  return result.isEmpty() ? null : result.array().map((e) => e.msg);
}

const signupValidators = [
  body('email', 'Invalid email').trim().notEmpty().isEmail(),
  body('password', 'Password must be at least 4 characters').notEmpty().isLength({ min: 4 }),
];

const signinValidators = [
  body('email', 'Invalid email').trim().notEmpty().isEmail(),
  body('password', 'Password is required').notEmpty(),
];

passport.use(
  'local.signup',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const messages = await runValidation(req, signupValidators);
        if (messages) {
          return done(null, false, req.flash('error', messages));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return done(null, false, req.flash('error', ['Email is already in use']));
        }

        const newUser = new User({ email });
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'local.signin',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const messages = await runValidation(req, signinValidators);
        if (messages) {
          return done(null, false, req.flash('error', messages));
        }

        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, req.flash('error', ['No user found']));
        }

        const passwordValid = await user.validPassword(password);
        if (!passwordValid) {
          return done(null, false, req.flash('error', ['Wrong password']));
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
