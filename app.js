require('dotenv').config()

const express = require("express")
const app = express()

const { connectDB } = require('./config/db')
connectDB()

const mongoose = require("mongoose")
const mongoStore = require('connect-mongo')

const store = mongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/Myblog',
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 60 * 60
})

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const passport = require('passport')
const local = require('passport-local')
const flash = require("connect-flash")

const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const session = require('express-session')

const User = require('./models/user')

const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1 * 60 * 60 * 1000,
        maxAge: 1 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions))
app.use(flash())
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new local(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
	res.locals.error = req.flash("error")
    res.locals.currUser = req.user

    next()
})

app.listen(8080, (req, res) => {
    console.log('success server')
})