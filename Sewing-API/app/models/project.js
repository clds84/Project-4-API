const mongoose = require('mongoose')
//  const User = require('./user')

const projectSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
		},
		fabric: {
			type: String,
			required: true,
		},
		interfacing: {
			type: String,
			required: true,
		},
        notions: {
            type: [String],
            required: true,
        },
        pattern: {
            type: String,
            required: true,
        },
        owner: {    
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: false,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Project', projectSchema)
