# Session Cart

A server-rendered shopping cart application built with **Node.js, Express, MongoDB, Mongoose, Passport.js, and Handlebars**.

The application provides product browsing, session-based cart management, user registration/login, protected checkout, CSRF protection, security middleware, rate limiting, structured logging, and persistent sessions stored in MongoDB.

## Features

### Shopping Cart
- Browse products on the home page.
- Add products to the shopping cart.
- View cart contents and total price.
- Reduce a product quantity by one.
- Cart data is maintained in the user's Express session.
- Checkout requires the user to be authenticated.
- Successful checkout currently clears the cart and redirects to the home page.

### User Authentication
- User registration using email and password.
- User sign-in and sign-out using Passport's Local Strategy.
- Passwords are hashed using `bcryptjs`.
- Authenticated users can access their profile.
- Passport sessions persist authentication across requests.
- User input is validated with `express-validator`.
- Flash messages are used for authentication errors.

### Security
- CSRF protection using `csrf-csrf`.
- Secure session cookies:
  - `httpOnly`
  - `sameSite: 'lax'`
  - `secure` in production
- Authentication endpoints are rate-limited to help prevent brute-force attacks.
- HTTP security headers are enabled with Helmet.
- Secrets and database configuration are loaded from environment variables.
- MongoDB-backed session storage is used instead of the default in-memory session store.

### Logging & Error Handling
- Structured application logging with `pino`.
- HTTP request logging with `pino-http`.
- Pretty logs are enabled during development.
- Centralized 404 and error handling is provided by Express.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | Web framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Express Handlebars | Server-side templating |
| Passport.js | Authentication |
| Passport Local | Email/password authentication |
| bcryptjs | Password hashing |
| express-session | Session management |
| connect-mongo | MongoDB session store |
| csrf-csrf | CSRF protection |
| express-validator | Request validation |
| express-rate-limit | Rate limiting |
| helmet | HTTP security headers |
| pino | Application logging |
| pino-http | HTTP request logging |
| dotenv | Environment configuration |
| Bootstrap 4 | UI styling |
| Font Awesome | Icons |

## Application Structure

```text
session-cart/
├── app.js
├── config/
│   ├── csrf.js
│   ├── logger.js
│   └── passport.js
├── public/
│   └── stylesheets/
│       └── style.css
├── routes/
│   ├── index.js
│   └── user.js
├── views/
│   ├── layouts/
│   │   └── layout.hbs
│   ├── partials/
│   │   └── header.hbs
│   ├── user/
│   │   ├── profile.hbs
│   │   ├── signin.hbs
│   │   └── signup.hbs
│   ├── checkout.hbs
│   ├── error.hbs
│   ├── index.hbs
│   └── shopping-cart.hbs
└── README.md
```

> The application also expects the product, user, and cart model modules referenced by the current routes and Passport configuration.

## Prerequisites

- **Node.js** — preferably a current LTS release.
- **npm**
- **MongoDB** — local MongoDB instance or MongoDB Atlas.
- A MongoDB database accessible through the configured `MONGO_URI`.

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd session-cart
npm install
```

Create a `.env` file in the project root.

### Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/shopping
SESSION_SECRET=replace-with-a-strong-random-secret
LOG_LEVEL=debug
```

`SESSION_SECRET` is required. The application will not start if it is missing.

A secure session secret can be generated with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For production, use a strong unique secret and set:

```env
NODE_ENV=production
```

This enables the `secure` flag on session cookies.

## MongoDB

By default, the application connects to:

```text
mongodb://localhost:27017/shopping
```

You can use MongoDB Atlas or another MongoDB deployment by changing `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

The application creates its MongoDB connection during startup.

Sessions are stored in MongoDB through `connect-mongo`.

## Running the Application

Start the application using the project's configured start script:

```bash
npm start
```

For development, if the project provides a development script:

```bash
npm run dev
```

The application is expected to be available at:

```text
http://localhost:3000
```

The port can be changed through the `PORT` environment variable if the project's server entry point uses it.

## Available Routes

### Public Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Displays available products |
| GET | `/add-to-cart/:id` | Adds a product to the session cart |
| GET | `/shopping-cart` | Displays the current shopping cart |
| GET | `/reduce/:id` | Reduces a product quantity by one |
| GET | `/user/signup` | Displays the registration page |
| POST | `/user/signup` | Creates a new user |
| GET | `/user/signin` | Displays the sign-in page |
| POST | `/user/signin` | Authenticates a user |

### Authenticated Routes

| Method | Route | Description |
|---|---|---|
| GET | `/user/profile` | Displays the authenticated user's profile |
| GET | `/user/logout` | Logs the current user out |
| GET | `/checkout` | Displays the checkout page |
| POST | `/checkout` | Processes the current checkout flow |

## Authentication Flow

### Sign Up

1. User submits an email and password.
2. CSRF protection validates the request.
3. Input is validated with `express-validator`.
4. The application checks whether the email already exists.
5. The password is hashed using `bcryptjs`.
6. The new user is stored in MongoDB.
7. Passport authenticates the newly created user.
8. The user is redirected to `/user/profile`.

### Sign In

1. User submits email and password.
2. CSRF protection validates the request.
3. Email and password are validated.
4. The user is retrieved from MongoDB.
5. The supplied password is checked against the stored hash.
6. Passport establishes the authenticated session.
7. The user is redirected to `/user/profile`.

## Cart Flow

The cart is stored in the Express session rather than persisted as a separate MongoDB document.

```text
Product
   │
   ▼
Add to Cart
   │
   ▼
Express Session
   │
   ├── View Cart
   ├── Reduce Quantity
   │
   ▼
Authenticated Checkout
   │
   ▼
POST /checkout
   │
   ▼
Cart Cleared
```

The cart is reconstructed from the session using the `Cart` model and is used to calculate the current items and total price.

## Checkout

Checkout is protected by authentication:

```text
GET /checkout
```

requires a logged-in user.

The checkout form contains a CSRF token:

```html
<input type="hidden" name="_csrf" value="{{csrfToken}}">
```

The order is submitted through:

```text
POST /checkout
```

The current implementation does **not** persist an order or integrate with a payment provider. After a successful POST, the session cart is cleared and the user is redirected to `/`.

### Current Checkout Limitation

The checkout route currently contains a TODO for:

- Persisting the order.
- Clearing the cart after successful order creation.
- Rendering an order confirmation page.
- Integrating a payment provider, if required.

## CSRF Protection

CSRF protection is implemented with `csrf-csrf`.

A token is generated for protected forms and submitted through the `_csrf` field.

Protected user operations include:

- Sign up
- Sign in
- Other requests handled through the user router

The checkout POST request is explicitly protected by `doubleCsrfProtection`.

The CSRF secret is derived from `SESSION_SECRET`, so a strong session secret is required.

## Rate Limiting

Sign-in and sign-up endpoints use `express-rate-limit`.

The current configuration allows:

```text
20 requests
per 15 minutes
per IP
```

When the limit is exceeded, the application returns:

```text
Too many attempts from this IP, please try again later.
```

## Security Headers

Helmet is enabled globally.

Content Security Policy is intentionally disabled:

```js
contentSecurityPolicy: false
```

because the current Handlebars layout loads Bootstrap, jQuery, Popper, and Font Awesome from external CDNs.

If the application is deployed publicly, CSP should be configured explicitly and the allowed external resources should be restricted.

## Sessions

Sessions use:

- `express-session`
- `connect-mongo`
- MongoDB

Current session cookie configuration:

```text
httpOnly: true
sameSite: lax
secure: true in production
maxAge: 180 minutes
```

The shopping cart is stored in the session, and Passport uses the same session mechanism for authentication.

## Logging

The application uses `pino` for structured logging and `pino-http` for HTTP request logging.

Development logging uses `pino-pretty` for readable console output.

Log level can be configured with:

```env
LOG_LEVEL=debug
```

or, for example:

```env
LOG_LEVEL=info
```

Production logging is emitted without the development pretty-print transport.

## Error Handling

The application includes:

1. A catch-all 404 handler.
2. A centralized Express error handler.
3. Development-only error details and stack traces.
4. Production-safe error rendering without exposing the full error object.

Database connection failures are logged and cause the application process to exit.

## UI

The frontend uses:

- Handlebars templates.
- Bootstrap 4.3.1.
- Font Awesome 5.8.2.
- A small custom stylesheet at `public/stylesheets/style.css`.

The main views are:

- Product listing
- Shopping cart
- Checkout
- Sign in
- Sign up
- User profile
- Error page

## Development Notes

The application is intentionally server-rendered and uses Express routes with Handlebars rather than a separate frontend framework.

Important application responsibilities are separated into:

```text
app.js
  ├── Application setup
  ├── Database connection
  ├── Middleware
  ├── Sessions
  ├── Authentication
  └── Route registration

config/
  ├── csrf.js
  ├── logger.js
  └── passport.js

routes/
  ├── index.js
  └── user.js

views/
  └── Handlebars templates
```

## Production Recommendations

Before deploying to production, consider:

- Use MongoDB Atlas or a managed MongoDB deployment.
- Use a strong, unique `SESSION_SECRET`.
- Keep secrets out of source control.
- Configure a strict Content Security Policy.
- Serve the application over HTTPS.
- Keep Node.js and npm dependencies updated.
- Run `npm audit` regularly.
- Add persistent order storage before enabling real checkout.
- Add proper authorization rules if additional user-specific resources are introduced.
- Replace GET-based state-changing cart/logout operations with POST/appropriate HTTP methods where practical.
- Add automated integration tests for authentication, cart operations, CSRF validation, and checkout.
- Add a real payment/order workflow if this is intended for production use.

## Known Limitations

The current codebase is a functional shopping-cart application, but it is not yet a complete e-commerce platform.

Current limitations include:

- Orders are not persisted.
- No payment gateway is integrated.
- No order history is available.
- The user profile page is minimal.
- There is no remove-all-cart endpoint even though the UI contains a placeholder for it.
- Product administration is not included.
- The current UI uses older Bootstrap/jQuery CDN dependencies.
- The checkout flow clears the cart without creating an order record.
- The project depends on model modules (`Cart`, `Product`, and `User`) that must be present for the application to run.

## License

Add the project's applicable license here, for example:

```text
MIT License
```

if the repository is intended to be distributed under the MIT license.
