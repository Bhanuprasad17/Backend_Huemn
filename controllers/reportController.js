const Borrow = require('../models/borrowModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

// 🟢 1. Most Borrowed Books
exports.mostBorrowedBooks = async (req, res) => {
  try {
    const data = await Borrow.aggregate([
      { $group: { _id: "$book", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          _id: 0,
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          count: 1
        }
      }
    ]);
    res.json({ message: "Most Borrowed Books", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 2. Active Members (Based on total borrows)
exports.activeMembers = async (req, res) => {
  try {
    const data = await Borrow.aggregate([
      { $group: { _id: "$user", totalBorrows: { $sum: 1 } } },
      { $sort: { totalBorrows: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          name: "$userDetails.name",
          email: "$userDetails.email",
          totalBorrows: 1
        }
      }
    ]);
    res.json({ message: "Most Active Members", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 3. Book Availability Summary
exports.bookAvailability = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalBorrowed = await Borrow.countDocuments({ returnedAt: { $exists: false } });
    const availableBooks = totalBooks - totalBorrowed;

    const summary = {
      totalBooks,
      totalBorrowed,
      availableBooks
    };

    res.json({ message: "Book Availability Summary", summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
