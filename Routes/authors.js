const express = require('express')
const router = express.Router()
const Author = require('../Models/author')  
const Book = require('../Models/book')

/// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== ''){ ///req.query because is a GET request /// req.query.name because is the name of the input in the form /// if empty shows all authors
        searchOptions.name = new RegExp(req.query.name, 'i') /// i means case insensitive /// RegExp searches for a partial match
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('Authors/index', {
            authors: authors,   
            searchOptions: req.query
        })
    } catch{
        res.redirect('/')
    }
    res.render('Authors/index')
})


//// New author route
router.get('/new', (req, res) => {
    res.render('Authors/new', {author:new Author()})
})


//// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try{
        const newAuthor = await author.save()
        res.redirect(`Authors/${author.id}`)
    } catch{
        res.render('Authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec() ///limit(6) means that we only want to show 6 books
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    }
    catch(err){
        console.log(err)
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('Authors/edit', {author: author})
    }
    catch{
        res.redirect('/Authors')
    }
})

router.put('/:id', async (req, res) => {  ///is a PUT request and its for editing or updating the author
    let author ///defined here because we need to use it in the try and catch blocks
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/Authors/${author.id}`)
    } catch{
        if(author == null){
            res.redirect('/')
        }
        else{
            res.render('Authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author ///defined here because we need to use it in the try and catch blocks
    try{
        author = await Author.findById(req.params.id)
        await author.deleteOne()
        res.redirect('/Authors')
    } catch{
        if(author == null){
            res.redirect('/')
        }
        else{
            res.redirect(`/Authors/${author.id}`)
        }
    }
})

module.exports = router