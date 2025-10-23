const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middlewares/authMIddleware');
const { mostBorrowedBooks, activeMembers, bookAvailability } = require('../controllers/reportController');

// Admin-only access for reports
router.get('/most-borrowed', protect, admin, mostBorrowedBooks);
router.get('/active-members', protect, admin, activeMembers);
router.get('/availability', protect, admin, bookAvailability);

module.exports = router;
