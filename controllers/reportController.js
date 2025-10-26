const Borrow = require('../models/borrowModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

// 🟢 1. Most Borrowed Books
exports.mostBorrowedBooks = async (req, res) => {
  try {
    const borrowCounts = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",      // group by book ID
          count: { $sum: 1 } // count how many times borrowed
        }
      },
      {
        $project: {
          _id: 0,            // remove MongoDB _id field
          bookId: "$_id",    // rename _id to bookId for clarity
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const data = await Promise.all(
      borrowCounts.map(async (item) => {
        const book = await Book.findById(item.bookId);
        return {
          title: book?.title,
          author: book?.author,
          count: item.count
        };
      })
    );

    res.json({ message: "Most Borrowed Books", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🟢 2. Active Members (Based on total borrows)
exports.activeMembers = async (req, res) => {
  try {
    const borrowCounts = await Borrow.aggregate([
      {
        $group: {
          _id: "$user",               // group by user ID
          totalBorrows: { $sum: 1 }   // count total borrows
        }
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",             // rename _id to userId
          totalBorrows: 1
        }
      },
      { $sort: { totalBorrows: -1 } },
      { $limit: 5 }
    ]);

    const data = await Promise.all(
      borrowCounts.map(async (item) => {
        const user = await User.findById(item.userId);
        return {
          name: user?.name,
          email: user?.email,
          totalBorrows: item.totalBorrows
        };
      })
    );

    res.json({ message: "Most Active Members", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🟢 3. Book Availability Summary

exports.bookAvailability = async (req, res) => {
  try {
    const summary = await Book.aggregate([
      {
        $group: {
          _id: "$genre",
          totalBooks: { $sum: 1 },
          totalCopies: { $sum: "$copies" }
        }
      },
      {
        $project: {
          _id: 0,
          genre: "$_id",
          totalBooks: 1,
          totalCopies: 1
        }
      }
    ]);

    const totalBorrowed = await Borrow.countDocuments({ returnedAt: { $exists: false } });

    res.json({
      message: "Book Availability Summary",
      totalBorrowed,
      summary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};