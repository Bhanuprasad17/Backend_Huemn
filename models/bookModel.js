const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    ISBN: { type: String, required: true },
    publicationDate: { type: Date },
    genre: { type: String },           // fixed spelling
    copies: { type: Number, default: 1 },  // match your POST body
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Book", bookSchema);
