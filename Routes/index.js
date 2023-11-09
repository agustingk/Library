const express = require('express')
const router = express.Router()
const Book = require('../Models/book')

router.get('/', async (req, res) => { ///async is used to make the function asynchronous which means that the function will not be executed until the function before it is finished
    let books
    try{
        books = await Book.find().sort({ createAt: 'desc'}).limit(10).exec() ///await is used to wait for the function to finish
    }
    catch{
        books=[]
    }
    res.render('index', {books: books })
})

module.exports = router 