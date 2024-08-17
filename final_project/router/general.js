const express = require('express');
let books = require('./booksdb.js'); // Import the book data
let users = require('./auth_users.js').users; // Import the users list
const public_users = express.Router();

// Helper function to convert the books object to an array
const getBooksArray = () => Object.values(books);

// Helper function to find book by ISBN (in this case, the book ID)
const findBookById = (id) => books[id];

// Helper function to check if username exists
const isUsernameTaken = (username) => users.some(user => user.username === username);

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isUsernameTaken(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  res.json(getBooksArray()); // Send the list of all books as an array
});

// Get book details based on ID
public_users.get('/isbn/:id', (req, res) => {
  const { id } = req.params;
  const book = findBookById(id);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const booksByAuthor = getBooksArray().filter(book => book.author === author);

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ message: 'No books found by this author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const booksByTitle = getBooksArray().filter(book => book.title.toLowerCase() === title.toLowerCase());

  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ message: 'No books found with this title' });
  }
});

// Get book review based on ID
public_users.get('/review/:id', (req, res) => {
  const { id } = req.params;
  const book = findBookById(id);

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.json(book.reviews);
    } else {
      res.json({ message: 'No reviews available for this book' });
    }
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

module.exports.general = public_users;
