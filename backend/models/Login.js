const mongoose=require('mongoose');

const loginSchema=new mongoose.Schema({
    email:{
        type: String,
        unique:true,
        required: true
    },
    password:{
        type:String,
        default: null
    },
    otp: {
         type: String,
          required: true
         },
    creation_date:{
        type:Date,
        default:Date.now()
    },
    register:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Register',
        required:true

    },
    course:{
        type: [String], 
        default: [] 
    }
})
const LoginModel=mongoose.model('Login',loginSchema);

module.exports=LoginModel;
