const Section=require("../models/Section");
const Coursse=require("../models/Course");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection=async(req,res)=>{
    try{
          //data fetch
          const{sectionName,courseId}=req.body;
          //data validation
          if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
              
          }
          //create section
          const newSection=await Section.create({sectionName});
 //update course with section OBjectId
          const updatedCourseDetails=await Course.findByIdAndUpdate(
            courseId,{
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
           )
           //return response
           return res.status(200).json({
            success:true,
            message:'Section created succesfully',
            updatedCourseDetails,
           })
    }
    catch(error){
            return res.status(500).json({
                success:false,
                message:"Unable to create Section,please try again",
                error:error.message,
            })
    }
}

exports.updateSection=async(req,res)=>{
    try{
            //data input
            const{sectionName,sectionId}=req.body;
            //data validation
            if(!sectionName||!sectionId){
                return res.status(400).json({
                    success:false,
                    message:'Missing Properties',
                });
                  
              }
            //update data
            const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
            //return res
            return res.status(200).json({
                success:true,
                message:'section updated success',
            })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section,please try again",
            error:error.message,
        })
    }
}

// exports.deleteSection=async(req,res)=>{
//     try{
//         //get id assume we are passing id to params
//         const{sectionId}=req.params
//         //use findbyid and delete
//         await Section.findByIdAndDelete(sectionId);
//         //to do we need to delte section from course
      
//         //return response  
//         return res.status(200).json({
//             success:true,
//             message:"Section Deleted Successfully",
//         })
//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:"Unable to delete Section,please try again",
//             error:error.message,
//         })
//     }
// }
exports.deleteSection = async (req, res) => {
	try {
		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {$pull: {courseContent: sectionId,}})                 

		const section = await Section.findById(sectionId);
		if(!section) {
			return res.status(404).json({success:false, message:"Section not Found",})	 
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({                               //here there is no use of const course , its only store updated course;
			path:"courseContent",                                                               // if you also write without  "const course = " then it also work;
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} 
    catch (error) {
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   

//add by me
exports.getSectionDetails=async(req,res)=>{
    console.log("hello from get Section data");
    try{
           //get id
           const {sectionId}=req.params;
           console.log(sectionId);
           //find course details
           const sectionDetails=await Section.find(
            {_id:sectionId})
            .populate("sectionName")
          // .populate("ratingAndreviews")
          .populate({
            path: 'subSection',
            model: 'SubSection' // replace 'SubSection' with your actual SubSection model name
        })
            .exec();
console.log(sectionDetails);
            //validation
            if(!sectionDetails){
                return res.status(400).json({
                    success:false,
                    message:`could not find the section with ${sectionId}`,
                })
            }
            //return response
            return res.status(200).json({
                success:true,
                message:"Section Details fetched Successfully",
                data:sectionDetails,
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