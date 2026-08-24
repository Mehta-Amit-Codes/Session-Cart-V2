require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');

const indexRouter = require('./routes/index');
const userRoutes = require('./routes/user');
const logger = require('./config/logger');

const app = express();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopping';
const SESSION_SECRET = process.env.SESSION_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set. Add it to your .env file before starting the app.');
}

// --- Database connection ---
mongoose
  .connect(MONGO_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });

require('./config/passport');

// --- View engine setup ---
app.engine(
  '.hbs',
  engine({
    defaultLayout: 'layout',
    extname: '.hbs',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// --- Security & core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com',
          'https://code.jquery.com',
          'https://stackpath.bootstrapcdn.com',
          "'unsafe-inline'",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
          'https://stackpath.bootstrapcdn.com',
          'https://use.fontawesome.com',
        ],
        fontSrc: [
          "'self'",
          'https:',
          'data:',
          'https://use.fontawesome.com',
          'https://cdnjs.cloudflare.com',
        ],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Rate limiting for auth routes (brute-force protection) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts from this IP, please try again later.',
});
app.use('/user/signin', authLimiter);
app.use('/user/signup', authLimiter);

// --- Sessions ---
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      maxAge: 180 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

// --- Routes ---
app.use('/user', userRoutes);
app.use('/', indexRouter);

// --- 404 handler ---
app.use((req, res, next) => {
  next(createError(404));
});

// --- Error handler ---
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = NODE_ENV === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
