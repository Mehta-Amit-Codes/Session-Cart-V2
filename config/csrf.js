const { doubleCsrf } = require('csrf-csrf');

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.sessionID,
  getTokenFromRequest: (req) => req.body._csrf,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'lax',
    secure: (process.env.NODE_ENV || 'development') === 'production',
  },
});

module.exports = { doubleCsrfProtection, generateToken };