const CourseProgress = require("../models/CourseProgress");
const Profile=require("../models/Profile");
const User=require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");
const {convertSecondsToDuration}=require("../utils/secToDuration");
const Course=require("../models/Course")
exports.updateProfile=async(req,res)=>{
    try{
        //get data
        const{dateOfBirth="",about="",contactNumber,gender}=req.body;
        //get userId
        const id=req.user.id;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({

                success:false,
                message:'All fields are required',
            });
        }
        //find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:'profile update success',
            profileDetails,
        })
    }
    catch(error){
         return res.statuss(500).json({
            success:false,
            error:error.message,
         });
    }
}
//delete account
exports.deleteAccount=async(req,res)=>{
    try{
        //get id
        const id=req.user.id;
        //validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not Found',
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //todo:unenroll use from all enrolled course
        //delete user
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:'user delete success',
        })

    }
    catch(error){
          return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
          })
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try{
           //get id
           const id=req.user.id;
           //validation and get user details
           const userDetails=await User.findById(id).populate("additionalDetails").exec();
           //return response
           return res.status(200).json({
            success:true,
            message:'data fetch succefully',
            userDetails,
           })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {

    try {
      const displayPicture = req.files.displayPicture
      console.log("displaypictur",displayPicture);
      const userId = req.user.id
      console.log(userId);
      const image = await uploadImageToCloudinary(displayPicture,  process.env.FOLDER_NAME,  1000,  1000 )
         console.log(image);
      const updatedProfile = await User.findByIdAndUpdate({ _id: userId }, { image: image.secure_url },  { new: true })
       
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  
  exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      console.log("userId",userId);
      let userDetails = await User.findOne({ _id: userId, })
          .populate({
            path: "courses",
            populate: {
              path: "courseContent",
              populate: {
                path: "subSection",
              },
            },
          })
          .exec() 
      userDetails = userDetails.toObject()
      // console.log("userDetails",userDetails);
      // console.log("userdetail courselength",userDetails.courses.length)
      var SubsectionLength = 0
      for(var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
      //  console.log("useDetail coursecontent length",userDetails.courses[i].courseContent.length)
        for(var j = 0; j < userDetails.courses[i].courseContent.length; j++){
            totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
            // console.log("totalduration",totalDurationInSeconds);
            // console.log("convert to sectond",convertSecondsToDuration(totalDurationInSeconds))
            userDetails.courses[i].totalDurationInSeconds = convertSecondsToDuration(totalDurationInSeconds)
            console.log("userdetails.totalduration", userDetails.courses[i].totalDurationInSeconds);
            SubsectionLength +=  userDetails.courses[i].courseContent[j].subSection.length
        }
        // console.log("Subsectionlength",SubsectionLength);
        // console.log("courseprogress",CourseProgress);
        let courseProgressCount = await CourseProgress.findOne({courseID: userDetails.courses[i]._id,  userId: userId,})
        //console.log("courseProgressCountline1",courseProgressCount);
        courseProgressCount = courseProgressCount?.completedVideos.length
       // console.log("courseProgressCount",courseProgressCount);
        if(SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } 
        else {                                             // To make it up to 2 decimal point 
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =  Math.round( (courseProgressCount / SubsectionLength) * 100 * multiplier ) / multiplier
        }
      }
  
      if(!userDetails) {
         return res.status(400).json({success: false,  message: `Could not find user with id: ${userDetails}`,})
      }
  
      console.log("courses after 400",userDetails.courses);
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  
  exports.instructorDashboard = async (req, res) => {
   try{
    console.log("hello from instructor deshboard");
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  console.log("courseDetails",courseDetails);
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course?.studentsEnrolled?.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          totalStudentsEnrolled,                               // Include other course properties as needed
          totalAmountGenerated,
        }
        console.log("courseDataWithStates",courseDataWithStats);
        return courseDataWithStats
      })
  
       res.status(200).json({
          courses: courseData,
        })
    } catch (error) {
      console.log("error",error);
       console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
   }
   catch(error){
    console.log(error);
   }
  }

 