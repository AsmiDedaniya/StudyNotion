const Course=require("../models/Course");
const Category=require("../models/Category");
const User=require("../models/User");
const{uploadImageToCloudinary}=require("../utils/imageUploader");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress=require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

//create course handler function
exports.createCourse=async(req,res)=>{
    console.log("hello from create course");
    try{
            //fetch data
            const{courseName,courseDescription,whatYouWillLearn,price,category}=req.body;
            //get thumbnail
            const thumbnail=req.files.thumbnailImage;
            console.log(thumbnail);
            //validation
            if(!courseName ||!courseDescription || !whatYouWillLearn || !price ||!category || !thumbnail){
                return res.status(400).json({
                    success:false,
                    message:'All fiels are required',
                })
            }
            //check for instructor
            const userId=req.user.id;
            const instructorDetails=await User.findById(userId);
            console.log("Instructor Details",instructorDetails);
            if(!instructorDetails){
                return res.status(404).json({
                    success:false,
                    message:'Instructor Details not found',
                })
            }
            //validate tag
            const categoryDetails=await Category.findById(category);
            if(!categoryDetails){
                return res.status(404).json({
                    success:false,
                    message:'Tag is not found',
                })
            }

            //upload image to cloudinary
            const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

            //create an entry for new Course
            const newCourse=await Course.create({
                courseName,
                courseDescription,
                instructor:instructorDetails._id,
                whatYouWillLearn:whatYouWillLearn,
                price,
                category:categoryDetails._id,
                thumbnail:thumbnailImage.secure_url,
            })

            //add new course to the user schema of instructor
            await User.findByIdAndUpdate(
                {_id:instructorDetails._id},
                {
                    $push:{
                        courses:newCourse._id,
                    }
                },
                {new:true},
                );
                //update the tag schema  //written  by me
                await Category.findOneAndUpdate(
                    {_id:categoryDetails._id},
                    {
                        $push:{
                            courses:newCourse._id,
                        }
                    }
                    )

                //return responce
                return res.status(200).json({
                    success:true,
                    message:"Course Created Successfully",
                    data:newCourse,
                })
    }
    catch(error){
          console.error(error);
          return res.status(500).json({
            success:false,
            message:'Failed to create new course',
            error:error.message,
          })
    }
}

//get all course handler function
exports.showAllCourses=async(req,res)=>{
    try{
          const allCourses=await Course.find({});
        

return res.status(200).json({
    success:true,
    message:'Data for all course fetch successfully',
    data:allCourses,
})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
          success:false,
          message:'Failed to create new course',
          error:error.message,
        })
    }
}
//getCourseDetails
// exports.getCourseDetails=async(req,res)=>{
//     connsole.log("hello from get course data");
//     try{
//            //get id
//            const {courseId}=req.body;
//            //find course details
//            const courseDetails=await Course.find(
//             {_id:courseId})
//             .populate({
//                 path:"instructor",
//                 populate:{
//                     path:"additionalDetails",
//                 },
//             })
//             .populate("category")
//           // .populate("ratingAndreviews")
//           .populate({
//             path: "courseContent",
//             populate: {
//               path: "subSection",
//             },
//           })
//             .exec();

//             //validation
//             if(!courseDetails){
//                 return res.status(400).json({
//                     success:false,
//                     message:`could not find the course with ${courseId}`,
//                 })
//             }
//             //return response
//             return res.status(200).json({
//                 success:true,
//                 message:"Course Details fetched Successfully",
//                 data:courseDetails,
//             })
           
//     }
//     catch(error){
//            console.log(error);
//            return res.status(500).json({
//             success:false,
//             message:error.message,
//            })
//     }
// }

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params
    const courseDetails = await Course.findOne({ _id: courseId, })
                          .populate({
                            path: "instructor",
                            populate: {
                              path: "additionalDetails",
                            },
                          })
                          .populate("category")
                          .populate("ratingAndReviews")
                          .populate({
                            path: "courseContent",
                            populate: {
                              path: "subSection",
                              select: "-videoUrl",
                            },
                          })
                          .exec()

    if(!courseDetails){
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {courseDetails, totalDuration,},
    })
  }
   catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }


  // exports.getInstructorCourses = async (req, res) => {
  //   try {
      
  //     const instructorId = req.user.id                      // Get the instructor ID from the authenticated user or request body
  
  //     // Find all courses belonging to the instructor
  //     const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })
        
  //     res.status(200).json({                     // Return the instructor's courses
  //       success: true,
  //       data: instructorCourses,
  //     })
  //   }
  //    catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to retrieve instructor courses",
  //       error: error.message,
  //     })
  //   }
  // }
  exports.getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id; // Get the instructor ID from the authenticated user or request body
  
        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({ instructor: instructorId }).sort({ createdAt: -1 });
        
        // Return the instructor's courses
        res.status(200).json({                     
            success: true,
            data: instructorCourses,
        });
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        });
    }
};

  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      
      const course = await Course.findById(courseId)                     // Find the course
      if(!course){
        return res.status(404).json({ message: "Course not found" })
      }
  
      const studentsEnrolled = course.studentsEnrolled                   // Unenroll students from the course
      for(const studentId of studentsEnrolled){
        await User.findByIdAndUpdate(studentId, {$pull: { courses: courseId },})
      }
  
      const courseSections = course.courseContent                   // Delete sections and sub-sections
      for(const sectionId of courseSections) {
        const section = await Section.findById(sectionId)             // Delete sub-sections of the section
        if(section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
        await Section.findByIdAndDelete(sectionId)           // Delete the section
      }
  
      await Course.findByIdAndDelete(courseId)                  // Delete the course
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    }
     catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }  

  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.params
      const userId = req.user.id
      console.log("courseId",courseId);
      console.log("userId",userId);
      const courseDetails = await Course.findOne({ _id: courseId, })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
                          console.log("courseDetails",courseDetails);
  
      let courseProgressCount = await CourseProgress.findOne({courseID: courseId,  userId: userId,})

      console.log("courseProgressCount",courseProgressCount);
  
      if(!courseDetails){
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

      console.log("totalDuration:",totalDuration);
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [], 
        },
      })
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  