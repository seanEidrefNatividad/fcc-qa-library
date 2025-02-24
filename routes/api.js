/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';


const mongoose = require('mongoose');
mongoose.connect(process.env.DB);

const Book = mongoose.model('Book', { 
  title: String, 
  comments: {
    type: [String],
  } ,
  commentcount: { 
    type: Number,
    default: 0
  },
});

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      res.send( await Book.find({}))
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if (!title) {
        res.send("missing required field title")
      } else {
        const book = new Book({ title, });
        book.save().then((book) => { 
          const {_id} = book
          res.send({_id,title})
        });
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(async function(req, res){
      try {
        const book = await Book.deleteMany({});
        if (book) {
          res.send("complete delete successful")
        }
      } catch (error) {
        res.send("no book exists")
      }
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;

      try {
        const book = await Book.findById({_id: bookid});
        const {title, _id, comments = []} = book;
        res.send({title, _id, comments})
      } catch (error) {
        res.send("no book exists")
      }
      //json res format: {"_id": bookid, "title": book_title, "comment": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        res.send("missing required field comment")
        return
      }

      try {
        const book = await Book.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment }, $inc: { commentcount: 1, __v:1 } }, // Adds 'cycling' to the hobbies array
          { new: true } // Returns updated document
        );

        const {title, _id, comments = [], commentcount, __v} = book;
        res.send({comments, _id, title, commentcount, __v })

      } catch (error) {
        res.send("no book exists")
      }
      //json res format same as .get
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;

      try {
        const book = await Book.findOneAndDelete({_id:bookid});
        if (book == null) {
          res.send("no book exists")
        } else {
          res.send("delete successful")
        }
        //console.log("book: "+ book)
      } catch (error) {
        res.send("no book exists")
      }
      //if successful response will be 'delete successful'
    });
  
};
