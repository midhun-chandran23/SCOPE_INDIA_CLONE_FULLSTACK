const mongoose = require('mongoose');

var genderEnum = ['Male', 'Female', 'Other'];

const registerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: genderEnum,
        required: true
    },
    educationqualification: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobilenumber: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    // trainingMode: {
    //     type: String,
    //     required: true
    // },
    // location: {
    //     type: String,
    //     required: true
    // },
    // timings: [{
    //     type: String,
    //     required: true
    // }],
    // address: {
    //     type: String,
    //     required: true
     
    // },
    // guardianName: {
    //     type: String,
    //     required: true
        
    // },
    // guardianOccupation: {
    //     type: String,
    //     required: true
      
    // },
    // guardianMobile: {
    //     type: String,
    //     required: true
       
    // },
    // zip: {
    //     type: String,
    //     required: true
        
    // },
    image: {
        type: String,
        required: true
    }
});

const RegisterModel = mongoose.model('Register', registerSchema);

module.exports = RegisterModel;
