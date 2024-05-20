const mongoose=require("mongoose");
const ratingandreviewSchema=new mongoose.Schema({
   course:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Course"
   },
   user:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
   },
   rating:{
    type:Number,
    required:true,
   },
   review:{
    type:String,
    required:true,
   }
});

module.exports=mongoose.model("RatingAndReview",ratingandreviewSchema);