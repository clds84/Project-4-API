// import dependencies
const mongoose = require('mongoose')
const commentSchema = require('./comment')
// profile is a subdocument, i.e. NOT a model

// we dont need to get model from mongoose, so in order to save some real estate, we'll just use the standard syntax for creating a schema like this:
const topicDiscussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
        type: String,
        required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
    comments: [commentSchema]
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('topicDiscussion', topicDiscussionSchema)