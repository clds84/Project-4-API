// import dependencies
const mongoose = require('mongoose')
// profile is a subdocument, i.e. NOT a model
const User = require('./user')

// we dont need to get model from mongoose, so in order to save some real estate, we'll just use the standard syntax for creating a schema like this:
const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    about: {
      type: String,
      required: true,
    },
    sewingBackground: {
      type: String,
      required: true,
    },
    openToCollab: {
        type: Boolean,
        required: false,
    },
    machineType: {
        type: String,
        required: true,
    },
    preferredNotions: {
        type: [String],
        required: true,
    },
    projectBucketlist: {
        type: [String],
        required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Profile', profileSchema)