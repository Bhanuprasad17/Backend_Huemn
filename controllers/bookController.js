const Book = require("../models/bookModel");

// -------------------------
// ADD BOOK
// -------------------------
const addBook = async (req, res) => {
  try {
    const { title, author, ISBN, publicationDate, genre, copies } = req.body;

    // Basic validation
    if (!title || !author || !ISBN) {
      return res.status(400).json({ message: "Title, author, and ISBN are required." });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      return res.status(409).json({ message: "A book with this ISBN already exists." });
    }

    const newBook = await Book.create({
      title,
      author,
      ISBN,
      publicationDate,
      genre,
      copies: copies || 1,
    });

    res.status(201).json({
      message: "Book added successfully.",
      book: newBook,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------
// UPDATE BOOK
// -------------------------
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json({
      message: "Book updated successfully.",
      book,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------
// DELETE BOOK
// -------------------------
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json({ message: "Book deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------
// LIST BOOKS (with Filters + Pagination)
// -------------------------
const listBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;

    const query = {};
    if (author) query.author = author;
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      books,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addBook, updateBook, deleteBook, listBooks };
