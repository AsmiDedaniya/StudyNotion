const Category=require("../models/Category");
//create tag handler function

exports.createCategory=async(req,res)=>{
    try{
             //fetch data
             const{name,description}=req.body;
             //validation

             if(!name|| !description){
                return res.status(400).json({
                    success:false,
                    message:'All fiels required',
                })
             }
             //creatte entry in db
             const categoryDetails=await Category.create({
                name:name,
                description:description,
             })
              console.log(categoryDetails);
              //return response
              return res.status(200).json({
                success:true,
                message:"Category Created Successfully",
              })
    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:error.message,
         })
    }
}

//get all tags handler function
exports.showAllcategory=async(req,res)=>{
 // console.log("hello from controoler category");
    try{
          const allCategory=await Category.find({},{name:true,description:true});
        console.log("allcategory:",allCategory);
          res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allCategory,
          })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
         })
    }
}

exports.categoryPageDetails=async(req,res)=>{
  try{
        const{categoryId}=req.body;
        //get courses for the specifie categiry
        const selectedCategory=await Category.findById(categoryId).populate("courses").exec();
        console.log(selectedCategory);
        if(!selectedCategory){
          console.log("Category not found");
          return res.status(404).json({success:false,
          message:"category not found"});
        }
        if(selectedCategory.courses.length===0){
           console.log("No courses found for the selected category");
           return res.status(404).json({
            success:false,
            message:"No courses found for the selected category",
           })
        }

        const selectedCourses=selectedCategory.courses;

        const categoriesExceptSelected=await Category.find({
          _id:{$ne:categoryId},

        }).populate("courses");
        let differentCourses=[];
        for(const category of categoriesExceptSelected){
          differentCourses.push(...category.courses);
        }
        //get top selling courses across all categories
        const allCategory=await Category.find().populate("courses");
        const allCourses=allCategory.flatMap((category)=>category.courses);
        const mostSellingCourses=allCourses
        .sort((a,b)=>b.sold-a.sold)
        .slice(0,10);

        res.status(200).json({
          selectedCourses:selectedCourses,
          differentCourses:differentCourses,
          mostSellingCourses:mostSellingCourses,
        });
  }
  catch(error){
      return res.status(500).json({
        success:false,
        message:"Internal server error",
        error:error.message,
      })
  }
}