const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Check if the username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;
  const { isbn } = req.params;

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const { isbn } = req.params;

    const username = req.session.authorization?.username;
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const book = books[isbn];
    if (!book) {
    return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
    }

    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;