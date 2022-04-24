// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Project = require('../models/project')

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
router.get('/projects', requireToken, (req, res, next) => {
	Project.find()
		.then((projects) => {
			// `examples` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return projects.map((project) => project.toObject())
		})
		// respond with status 200 and JSON of the examples
		.then((projects) => res.status(200).json({ projects: projects }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// SHOW
// GET /projects/6265525bd078af1d97610e32
//NOTE: some routes will have user ID as part of the document, but some will not.
//the ones that won't will be seeded data by the creator, me in this case, bc I'm
//able to seed and not have to be a user to create projects that will be served as
//tutorials
router.get('/projects/:id', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Project.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "example" JSON
		.then((project) => res.status(200).json({ project: project.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})
// CREATE
// POST /projects
router.post('/projects', requireToken, (req, res, next) => {
	// set owner of new example to be current user
	req.body.project.owner = req.user.id

	Project.create(req.body.project)
		// respond to succesful `create` with status 201 and JSON of new "example"
		.then((project) => {
			res.status(201).json({ project: project.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})
// DESTROY
// DELETE /projects/
router.delete('/projects/:id', requireToken, (req, res, next) => {
	Project.findById(req.params.id)
		.then(handle404)
		.then((project) => {
			// throw an error if current user doesn't own `project`
			requireOwnership(req, project)
			// delete the example ONLY IF the above didn't throw
			project.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})
module.exports = router