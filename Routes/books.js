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
        res.redirect('Books')
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

router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec() ///populate('author') is to get the author name instead of the author id ///exec() is to execute the query
        res.render('Books/show', {book: book})
    }
    catch{
        res.redirect('/')
    }
})

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('Books/new', params)
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