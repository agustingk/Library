const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

/*
authorSchema.pre('remove', function(next){
    Book.find({ author : this.id }, (err, books) => {///this.id is the id of the author we are trying to delete
        if(err){///if there is an error finding the books with this author id then we will pass the error to the next function
            next(err)
        }
        else if(books.length > 0){
            next(new Error('This author has books still'))
        }
        else{
            next()///if there are no errors then we will just call next
        }
    })
})
*/

authorSchema.pre("deleteOne", async function (next) {
    try {
        const query = this.getFilter();
        const hasBook = await Book.exists({ author: query._id });
  
        if (hasBook) {
            next(new Error("This author still has books."));
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Author', authorSchema)