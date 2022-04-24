/////////////////////////////////
// import dependencies
/////////////////////////////////
const mongoose = require('mongoose')
const User = require('./user')

const commentSchema = new mongoose.Schema({
    note: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})
//module.exports = mongoose.model('Comment', commentSchema)
// use this since not a model? module.exports = commentSchema

