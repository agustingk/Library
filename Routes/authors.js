const express = require('express')
const router = express.Router()
const Author = require('../Models/author')  

/// All authors route
router.get('/', (req, res) => {
    res.render('authors/index')
})


//// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author:new Author()})
})


//// Create author route
router.post('/', (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    /*
    author.save((err, newAuthor) => {
        if (err){
            res.render('Authors/new',{
                author: author,
                errorMessage: 'Error creating Author'
            })
        }
        else{
            // res.redirect(`Authors/${newAuthor.id}`)
            res.redirect(`Authors`)
        }
    })
    */

    author.save().
        then((newAuthor) => {
            res.render('authors')
        }).
        catch((err) => {
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error Creating Author...'
        })
    })
})

module.exports = router