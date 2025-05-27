// defines what a user looks like in mongoDB(schema)
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, //no two users have the same email
    },
    password: {
        type: String,
        required: true,
    },

    profilepic: {
        type: String, //store the image url/filename
        default: '', //default blank
    }
},{
    timestamps: true, //adds createdat and updatedat automatically
});

module.exports = mongoose.model('User', userSchema);
