const express = require('express')
const router = express.Router()
const Author = require('../Models/author')  

/// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== ''){ ///req.query because is a GET request /// req.query.name because is the name of the input in the form /// if empty shows all authors
        searchOptions.name = new RegExp(req.query.name, 'i') /// i means case insensitive /// RegExp searches for a partial match
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,   
            searchOptions: req.query
        })
    } catch{
        res.redirect('/')
    }
    res.render('authors/index')
})


//// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author:new Author()})
})


//// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try{
        const newAuthor = await author.save()
        res.redirect(`Authors`)
    } catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

module.exports = router