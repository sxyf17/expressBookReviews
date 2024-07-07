const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user already exists
  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists" });
  } else {
    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
  }
});

// Get the book list 
public_users.get('/', async function (req, res) {
  try {
    const response = await { data: books };
    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  try {
    const response = await {data: books[isbn]};
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book", error: error.message });

  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const searched_author = req.params.author;
  const results = [];

  for (const id in books) {
    try {
        if (books[id].author === searched_author) {
            await results.push(books[id]);
          }
    } catch (error) {
        res.status(500).json({ message: "Author not found", error: error.message });

    }
  }
  if (results.length > 0) {
    res.json(results);
  } else {
    res.send('none found');
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const searched_title = req.params.title;
  const results = [];

  for (const id in books) {
    try {
        if (books[id].title === searched_title) {
            await results.push(books[id]);
          }
    } catch (error) {
        res.status(500).json({ message: "Title not found", error: error.message });

    }
  }
  if (results.length > 0) {
    res.json(results);
  } else {
    res.send('none found');
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const searched_isbn = req.params.isbn;
  for (const isbn in books) {
    if (isbn === searched_isbn) {
      res.send(books[isbn].reviews);
    }
  }
});

module.exports.general = public_users;