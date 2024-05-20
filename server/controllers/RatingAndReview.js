const ratingAndReview=require("../models/RatingAndReview");
const Course=require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

//createRating
// exports.createRating=async(req,res)=>{
//     try{
//              //get user id
//              const{userId}=req.user.id;
//              //fetchdata from req body
//              const{courseId,review,rating}=req.body;
//              //check if user is enrolled or not
//              const courseDetails=await Course.findOne({
//                 _id:courseId,
//                 studentsEnrolled:{$eleMatch:{$eq:userId}}
//              });
//              if(!courseDetails){
//                 return res.status(404).json({
//                     success:false,
//                     message:'Student is not enrolled in this course',
//                 })
//              }
//              //check if user already reviewd course
//              const alreadyReviewed=await RatingAndReview.findOne({
//                 user:userId,
//                 course:courseId,
//              });
//              if(alreadyReviewed){
//                 return res.status(403).json({
//                      success:false,
//                      message:'Course is alreay reviewed by the user',
//                 })
//              }
//              //create rating and review
//              const ratingReview=await RatingAndReview.create({
//                 rating,review,
//                 course:courseId,
//                 user:userId,
//              })
//              //update course this rating/review
//              await Course.findByIdAndUpdate({_id:courseId},
//                 {
//                     $push:{
//                         ratingAndReviews:RatingAndReview,
//                     }
//                 },
//                 {new:true})
//              //return response
//              return res.status(200).json({
//                 success:true,
//                 message:'Rating and Review created Successfully',
//                 ratingReview,
//              })
//     }
//     catch(error){
//            console.log(error);
//            return res.status(500).json({
//             success:false,
//             message:message.error,
//            })
//     }
// }

exports.createRating = async (req, res) => {
   console.log("hello from tating and review");
   try {
       // get user id
       const userId = req.user.id;

       // fetch data from req body
       const { courseId, review, rating } = req.body;

       // check if user is enrolled or not
       const courseDetails = await Course.findOne({
           _id: courseId,
           studentsEnrolled: { $in: [userId] } // Use $in instead of $eleMatch
       });

       if (!courseDetails) {
           return res.status(404).json({
               success: false,
               message: 'Student is not enrolled in this course',
           });
       }

       // check if user already reviewed the course
       const alreadyReviewed = await RatingAndReview.findOne({
           user: userId,
           course: courseId,
       });

       if (alreadyReviewed) {
           return res.status(403).json({
               success: false,
               message: 'Course is already reviewed by the user',
           });
       }

       // create rating and review
       const ratingReview = await RatingAndReview.create({
           rating,
           review,
           course: courseId,
           user: userId,
       });

       // update course with this rating/review
       await Course.findByIdAndUpdate(
           { _id: courseId },
           {
               $push: {
                   ratingAndReviews: ratingReview, // Use the created ratingReview
               }
           },
           { new: true }
       );

       // return response
       return res.status(200).json({
           success: true,
           message: 'Rating and Review created Successfully',
           ratingReview,
       });
   } catch (error) {
       console.log(error);
       return res.status(500).json({
           success: false,
           message: 'An error occurred while creating the rating and review',
       });
   }
};


//getAverageRating
exports.getAverageRating=async(req,res)=>{
   console.log("hello from get rating and reviews");
   try{
          //get course id
          const courseId=req.body.courseId;
          //calculate avg rating

          const result=await RatingAndReview.aggregate([
            {
               $match:{
                  course:new mongoose.Types.ObjectId(courseId),
               },
            },
            {
               $group:{
                  _id:null,
                  averageRating:{$avg:"$rating"},
               }
            }
          ])
          //return rating
          if(result.lenght>0){
            return res.status(200).json({
               success:true,
               averageRating:result[0].averageRating,
            })
          }

          //if no rating.review exist
          return res.status(200).json({
            success:true,
            message:'Average rating 0,no rating given till now',
            averageRating:0,
          })
   }
   catch(error){
         console.log(error);
         return res.status(500).json({
            success:false,
            message:error.message,
         })
   }
}

//getAllRatingAndReview
exports.getAllRating=async(req,res)=>{
   try{
       const allReviews=await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                 path:"user",
                                 select:"firstName lastName email image"
                                })
                                .populate({
                                 path:"course",
                                 select:"courseName",
                                })
                                .exec();
         return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
         })
   }
   catch(error){
      console.log(error);
      return res.status(500).json({
         success:false,
         message:error.message,
      })
   }
}