const mongoose=require('mongoose');

const hobbySchema=new mongoose.Schema({
    name:{
        type:String
    }
});

const HobbiesModel=mongoose.model('Hobbies',hobbySchema);

module.exports=HobbiesModel;