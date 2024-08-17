const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session middleware (if needed, otherwise you can remove it)
app.use(
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Authentication middleware for /customer routes
app.use('/customer', (req, res, next) => {
  // Skip authentication for login and register routes
  if (req.originalUrl.startsWith('/customer/login') || req.originalUrl.startsWith('/customer/register')) {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1]; // Assuming "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded; // Ensure this matches what you use in your routes
    next();
  });
});

// Define routes
app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
