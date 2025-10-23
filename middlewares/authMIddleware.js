const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes (authentication)
const protect = async (req, res, next) => {
  let token;
  console.log(token)

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
    console.log('Header Token:', req.headers.authorization);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

// Admin middleware (authorization)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { protect, admin };
