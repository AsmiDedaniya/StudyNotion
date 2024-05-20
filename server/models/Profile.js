const mongoose=require("mongoose");
const profileSchema=new mongoose.Schema({
   gender:{
    type:String,
   },
   dateOfBirth:{
      type:String,
   },
   about:{
    type:String,
    trim:true,
   },
   contactNumber:{
    type:Number,
    trim:true,
   },
   password:{
      type:Number,
   },
   newPassword:{
      type:Number,
   },
});

module.exports=mongoose.model("Profile",profileSchema);