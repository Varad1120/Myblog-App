const mongoose = require('mongoose')
const Schema = mongoose.Schema
const plm = require('passport-local-mongoose')

let userSchema = new Schema({
    username: {
        type: String,
    }
})

userSchema.plugin(plm.default || plm)

module.exports = mongoose.model("User", userSchema)