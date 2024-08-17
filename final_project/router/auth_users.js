const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js'); // Import books database
const regd_users = express.Router();

let users = []; // This should be replaced with your actual user database

// Helper function to check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Helper function to authenticate user by username and password
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// Route to register a new user
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Add new user to the users array
  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Route to login a user and issue a JWT token
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });

  return res.status(200).json({ message: 'Login successful', token });
});

// Middleware to authenticate user based on token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    req.user = user;
    next();
  });
};

// Route to add or modify a book review (authenticated users only)
regd_users.put('/auth/review/:isbn', authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const { username } = req.user;

  if (!review) {
    return res.status(400).json({ message: 'Review is required' });
  }

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Initialize reviews object if not present
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update the review
  book.reviews[username] = review;
  return res.status(200).json({ message: 'Review added successfully' });
});

// Route to delete a book review (authenticated users only)
regd_users.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { username } = req.user;  // Get the username from the token

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Check if the book has reviews
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Delete the review by the current user
  delete book.reviews[username];
  return res.status(200).json({ message: 'Review deleted successfully' });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
