const Book = require("../models/bookModel");
const Borrow = require("../models/borrowModel");
const mongoose = require('mongoose')

// ----------------------------
// Borrow book controller
// ----------------------------
const borrowBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookId } = req.body;
    if (!bookId)
      return res.status(400).json({ message: "Book ID is required" });

    // Find the book
    const book = await Book.findById(bookId).session(session);
    if (!book) throw new Error("Book not found");
    if (book.copies <= 0) throw new Error("No copies available");

    // Create borrow record
    const borrow = await Borrow.create(
      [{ user: req.user._id, book: book._id }],
      { session }
    );

    // Decrease book copies
    book.copies -= 1;
    await book.save({ session });

    // Commit changes if everything succeeds
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(borrow[0]);
  } catch (err) {
    // Rollback all operations if something fails
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------
// Return book controller (with transaction)
// ----------------------------
const returnBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // start the transaction

  try {
    const { bookId } = req.body;
    if (!bookId)
      return res.status(400).json({ message: "Book ID is required" });

    // Find the latest borrow record for this user and book that is not returned
    const borrow = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      returnedAt: { $exists: false },
    })
      .sort({ borrowedAt: -1 })
      .session(session); // attach session

    if (!borrow) throw new Error("Borrow record not found");

    // Mark as returned
    borrow.returnedAt = new Date();
    await borrow.save({ session }); // attach session

    // Increment book copies
    const book = await Book.findById(borrow.book).session(session); // attach session
    if (!book) throw new Error("Book not found");

    book.copies += 1;
    await book.save({ session }); // attach session

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json(borrow);
  } catch (err) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    session.endSession();
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
