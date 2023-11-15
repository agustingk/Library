const express = require('express')
const router = express.Router()
const Book = require('../Models/book') 
const Author = require('../Models/author')
const { listenerCount } = require('process')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] /// only this types of images are allowed
// const path = require('path')
// const fs = require('fs')
// const uploadPath = path.join('public', Book.coverImageBasePath)/// path.join() joins the path of the file with the path of the folder /// public is the folder where the images are stored /// Book.coverImageBasePath is the name of the folder where the images are stored
// const upload = multer({/// multer is a middleware that handles multipart/form-data /// upload is the name of the middleware
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {//// fileFilter is a function that filters the files that are uploaded
//         callback(null, imageMimeTypes.includes(file.mimetype))/// null is the error /// imageMimeTypes.includes(file.mimetype) checks if the file is an image
//     }
// })

/// All books route
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title && req.query.title.trim() !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))///'title' is based on the database register
    }
    if(req.query.publishedBefore && req.query.publishedBefore.trim() !== ''){
        query = query.lte('publishDate', req.query.publishedBefore)///let is less than or equal
    }
    if(req.query.publishedAfter && req.query.publishedAfter.trim() !== ''){
        query = query.gte('publishDate', req.query.publishedAfter)///gte is greater than or equal
    }
    try{
        const books = await query.exec()
        res.render('Books/index', {
            books: books,
            searchOptions: req.query
        })
    }
    catch{
        red.redirect('/')
    }
})

//// New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})


//// Create book route
router.post('/', async (req, res) => { //// upload.single('cover') is the middleware that handles the file upload /// 'cover' is the name of the input in the form
    // const fileName = req.file != null  ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
    }) 

    saveCover(book, req.body.cover)

    try{
        const newBook = await book.save()
        res.redirect(`Books/${newBook.id}`)
    } catch {
        // if(book.coverImageName != null){
        //     removeBookCover(book.coverImageName)
        // }
        renderNewPage(res, book, true)
    }
})


// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName), err =>{
//         if(err) console.error(err)
//     })
// }


//show book route
router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec() ///populate('author') is to get the author name instead of the author id ///exec() is to execute the query
        res.render('Books/show', {book: book})
    }
    catch{
        res.redirect('/')
    }
})

//edit book route
router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    }
    catch{
        res.redirect('/')
    }
})

/*
router.get('/:id/edit', async (req, res) => {
    try {
        const bookId = req.params.id.trim(); // Remove extra spaces
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            // If the ID is not valid, redirect or handle accordingly
            console.log('Invalid book ID');
            return res.redirect('/');
        }

        const book = await Book.findById(bookId);
        if (!book) {
            // If the book is not found, redirect or handle accordingly
            console.log('Book not found');
            return res.redirect('/');
        }

        renderEditPage(res, book);
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});*/


/// update book route
router.put('/:id', async (req, res) => {
    let book

    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover)
        }

        await book.save()
        res.redirect(`/Books/${book.id}`)
    } catch {
        if(book != null){
            renderEditPage(res, book, true)
        }
        else{
            res.redirect('/')
        }
    }
})

// delete book page
router.delete('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove()///this function does not exist in the documentation
        await book.deleteOne()///this function does exist
        res.redirect('/Books')
    }
    catch(e){
        if(book != null){
            console.log(e)
            res.render('Books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        }
        else{
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error Updating Book'
            }
            else{
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`Books/${form}`, params)
    } catch {
        res.redirect('/Books')
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded ==  null) return

    const cover = JSON.parse(coverEncoded)
    if(coverEncoded != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router