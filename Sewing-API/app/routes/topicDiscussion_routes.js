// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const topicDiscussion = require('../models/topicDiscussion')

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

// INDEX
// GET /topicDiscussion 
//
router.get('/topicDiscussion', requireToken, (req, res, next) => {
	topicDiscussion.find()
		.then((topicDiscussions) => {
			// `topicDiscussions` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return topicDiscussions.map((topicDiscussion) => topicDiscussion.toObject())
		})
		// respond with status 200 and JSON of the topicDiscussions
		.then((topicDiscussions) => res.status(200).json({ topicDiscussions: topicDiscussions }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// SHOW
// GET /topicDiscussions/6265525bd078af1d97610e32
router.get('/topicDiscussion/:id', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	topicDiscussion.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "topicDiscussion" JSON
		.then((topicDiscussion) => res.status(200).json({ topicDiscussion: topicDiscussion.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// CREATE
// POST /topicDiscussions
//
router.post('/topicDiscussion', requireToken, (req, res, next) => {
	// set owner of new topicDiscussion to be current user
	req.body.topicDiscussion.owner = req.user.id

	topicDiscussion.create(req.body.topicDiscussion)
		// respond to succesful `create` with status 201 and JSON of new "topicDiscussion"
		.then((topicDiscussion) => {
			res.status(201).json({ topicDiscussion: topicDiscussion.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})
// UPDATE
// PATCH /topicDiscussions/5a7db6c74d55bc51bdf39793
//
router.patch('/topicDiscussion/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.topicDiscussion.owner

	topicDiscussion.findById(req.params.id)
		.then(handle404)
		.then((topicDiscussion) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, topicDiscussion)

			// pass the result of Mongoose's `.update` to the next `.then`
			return topicDiscussion.updateOne(req.body.topicDiscussion)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// DESTROY
// DELETE /topicDiscussion/626574ae4df379dfeecf3773
router.delete('/topicDiscussion/:id', requireToken, (req, res, next) => {
	topicDiscussion.findById(req.params.id)
		.then(handle404)
		.then((topicDiscussion) => {
			// throw an error if current user doesn't own `topicDiscussion`
			requireOwnership(req, topicDiscussion)
			// delete the topicDiscussion ONLY IF the above didn't throw
			topicDiscussion.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
module.exports = router