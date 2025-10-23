const express = require('express');
const borrowRouter = express.Router();
const { protect } = require('../middlewares/authMIddleware');
const { borrowBook, returnBook, borrowHistory } = require('../controllers/borrowController');

// Borrow a book
borrowRouter.post('/', protect, borrowBook);

// Return a book
borrowRouter.post('/return', protect, returnBook);

// Borrow history
borrowRouter.get('/history', protect, borrowHistory);

module.exports = borrowRouter;
