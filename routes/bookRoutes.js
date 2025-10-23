const express = require('express');
const bookRouter = express.Router();
const { protect, admin } = require('../middlewares/authMIddleware');
const { addBook, updateBook, deleteBook, listBooks } = require('../controllers/bookController');


bookRouter.post('/',protect,admin,addBook);
bookRouter.put('/:id', protect,admin,updateBook);
bookRouter.delete('/:id',protect,admin,deleteBook);
bookRouter.get('/',protect,listBooks);



module.exports = bookRouter;