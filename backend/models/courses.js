const mongoose=require('mongoose');

const courseSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    }
});
const CourseModel=mongoose.model('Course',courseSchema);
module.exports=CourseModel;