if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

const indexRouter = require('./Routes/index')
const authorRouter = require('./Routes/authors')
const bookRouter = require('./Routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/Views')
app.set('layout', 'Layouts/layout')
app.use(expressLayouts)
app.use(express.static('Public'))
//app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', error => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/Authors', authorRouter)
app.use('/Books', bookRouter)

app.listen(process.env.PORT || 3000)


