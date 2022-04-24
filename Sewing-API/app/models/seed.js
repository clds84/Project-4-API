///////////////////////////////////////
// Import Dependencies
///////////////////////////////////////
//const mongoose = require('./connection')
const mongoose = require('mongoose')
const Project = require('./project')

////////////////////////////////////////////
// Seed Code
////////////////////////////////////////////
// save the connection in a variable
const db = require('../../config/db.js')
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.on('open', () => {
	console.log("db is open")
	const starterProject = [{
        type: "shirt",
		fabric: "poplin",
		interfacing:"medium-weight fusible",
        notions:["rotary cutter", "shears","point turner"],
        pattern: "self-drafted",
    },
    {
        type: "shirt collar",
	    fabric: "poplin",
		interfacing:"medium-weight fusible",
        notions:["rotary cutter", "shears","point turner"],
        pattern: "self-drafted",
    }
]

	// when we seed data, there are a few steps involved
	// delete all the data that already exists(will only happen if data exists)
	Project.remove({})
        .then(deletedProjects => {
		    console.log('this is what remove returns', deletedProjects)
		    // then we create with our seed data
            Project.create(starterProject)
                .then((data) => {
                    console.log('Here is the new seeded data re: starter projects', data)
                    mongoose.connection.close()
                })
                .catch(error => {
                    console.log(error)
                    mongoose.connection.close()
                })
	    })
        .catch(error => {
            console.log(error)
            mongoose.connection.close()
        })
	// then we can send if we want to see that data
})
