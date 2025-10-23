const Book = require("../models/bookModel");
const Borrow = require("../models/borrowModel");

// ----------------------------
// Borrow book controller
// ----------------------------
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body; // Get bookId from request body
    if (!bookId) return res.status(400).json({ message: "Book ID is required" });

    const book = await Book.findById(bookId);
    console.log("Book ID received:", bookId); 
    if (!book) return res.status(400).json({ message: 'Book not found' });
    if (book.copies <= 0) return res.status(400).json({ message: 'No copies available' });

    // Create borrow record
    const borrow = await Borrow.create({ user: req.user._id, book: book._id });

    // Decrease available copies
    book.copies -= 1;
    await book.save();

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Return book controller
// ----------------------------
const returnBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: "Book ID is required" });

    // Find the latest borrow record for this user and book that is not returned
    const borrow = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      returnedAt: { $exists: false }
    }).sort({ borrowedAt: -1 });

    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });

    // Mark as returned
    borrow.returnedAt = new Date();
    await borrow.save();

    // Increment book copies
    const book = await Book.findById(borrow.book);
    book.copies += 1;
    await book.save();

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Borrow history controller
// ----------------------------
const borrowHistory = async (req, res) => { 
  try {
    const history = await Borrow.find({ user: req.user._id })
      .populate('book', 'title author'); // populate only title & author
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { borrowBook, returnBook, borrowHistory };
