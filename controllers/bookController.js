const Book = require("../models/bookModel");

// Add Book
const addBook = async(req,res) =>{
   try {
     const {title, author, ISBN, publicationDate, genre, copies} = req.body;
     console.log("Request body received:", req.body);

     const book = await Book.create({title, author, ISBN, publicationDate, genre, copies});
     res.status(201).json(book)
   } catch (err) {
    res.status(500).json({message:err.message});
   }
};


// update Book

const  updateBook = async(req,res) =>{
     try{
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch(err){
    res.status(500).json({ message: err.message });
  }
};


// Delete book
const  deleteBook = async(req,res) =>{
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
    if(!book) return res.status(404).json({message : 'Book not found'});
    res.json({message:"Book deleted Sucessfully"})
 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const listBooks = async(req,res) =>{
    try {
        const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};
    if(author) query.author = author;
    if(genre) query.genre = genre;

    const books = await Book.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(query);
    res.json({ total, page: Number(page), books });
    } catch (err) {
         res.status(500).json({ message: err.message });
    }
}

module.exports ={addBook,updateBook,deleteBook,listBooks}


