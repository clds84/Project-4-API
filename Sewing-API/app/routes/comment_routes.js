// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Comment = require('../models/comment')
const TopicDiscussion = require('../models/topicDiscussion')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()



router.post('/comments/:topicDiscussionId', requireToken, (req, res, next) => {
    const topicDiscussionId = req.params.topicDiscussionId
    console.log('first comment body', req.body)
    
    // we'll adjust req.body to include an author
    // the author's id will be the logged in user's id
    //req.body.author = TopicDiscussion.owner
    //req.session.userId
    console.log('updated comment body', req.body)
    // we'll find the comments with the commentsId
    TopicDiscussion.findById(topicDiscussionId)
        .then(topicDiscussion => {
            // then we'll send req.body to the comments array
                topicDiscussion.comments.push(req.body)
            // save the comments
            return topicDiscussion.save()
        })
      	// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DELETE -> to destroy a comment
// we'll use two params to make our life easier
// first the id of the comments, since we need to find it
// then the id of the comment, since we want to delete it
// router.delete('/delete/:commentsId/:commId', (req, res) => {
//     // first we want to parse out our ids
//     const commentsId = req.params.commentsId
//     const commId = req.params.commId
//     // then we'll find the comments
//     comments.findById(commentsId)
//         .then(comments => {
//             const theComment = comments.comments.id(commId)
//             // only delete the comment if the user who is logged in is the comment's author
//             if ( theComment.author == req.session.userId) {
//                 // then we'll delete the comment
//                 theComment.remove()
//                 // return the saved comments
//                 return comments.save()
//             } else {
//                 return
//             }

//         })
//         .then(comments => {
//             // redirect to the comments show page
//             res.redirect(`/commentss/${commentsId}`)
//         })
//         .catch(error => {
//             // catch any errors
//             console.log(error)
//             res.send(error)
//         })
// })
module.exports = router