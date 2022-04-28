// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for projects
const Tutorial = require('../models/tutorial')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { project: { title: '', text: 'foo' } } -> { project: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// I will be using this model not
//only to serve for routes related to user projects, but also for project tutorials
//provided by the teacher(me)
// INDEX
// GET /projects
//this route will serve to grab all project documents. 
//NOTE: some routes will have user ID as part of the document, but some will not.
//the ones that won't will be seeded data by the creator, me in this case, bc I'm
//able to seed and not have to be a user to create projects that will be served as
//tutorials
router.get('/tutorials',  (req, res, next) => {
	Tutorial.find()
        .then((tutorials) => {
			// `projects` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return tutorials.map((tutorial) => tutorial.toObject())
		})
		// respond with status 200 and JSON of the projects
		.then((tutorials) => res.status(200).json({ tutorials: tutorials }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// SHOW
// GET /projects/6265525bd078af1d97610e32
//NOTE: some routes will have user ID as part of the document, but some will not.
//the ones that won't will be seeded data by the creator, me in this case, bc I'm
//able to seed and not have to be a user to create projects that will be served as
//tutorials
router.get('/tutorials/:id',  (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Tutorial.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "project" JSON
		.then((tutorial) => res.status(200).json({ tutorial: tutorial.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// CREATE
// POST /projects
router.post('/tutorials', requireToken, (req, res, next) => {
	// set owner of new project to be current user
	req.body.tutorial.owner = req.user.id

	Tutorial.create(req.body.tutorial)
		// respond to succesful `create` with status 201 and JSON of new "project"
		.then((tutorial) => {
			res.status(201).json({ tutorial: tutorial.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})
// UPDATE
// PATCH /projects/5a7db6c74d55bc51bdf39793
router.patch('/tutorials/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.tutorial.owner

	Tutorial.findById(req.params.id)
		.then(handle404)
		.then((tutorial) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, tutorial)

			// pass the result of Mongoose's `.update` to the next `.then`
			return tutorial.updateOne(req.body.tutorial)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// DESTROY
// DELETE /projects/
router.delete('/tutorials/:id', requireToken, (req, res, next) => {
	Tutorial.findById(req.params.id)
		.then(handle404)
		.then((tutorial) => {
			// throw an error if current user doesn't own `project`
			requireOwnership(req, tutorial)
			// delete the project ONLY IF the above didn't throw
			tutorial.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
module.exports = router