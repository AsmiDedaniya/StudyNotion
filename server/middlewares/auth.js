const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

//auth
exports.auth=async(req,res,next)=>{
  console.log("hello from auth");
    try{
          //extract error
          const authorizationHeader = req.header("Authorization");
          const token=req.cookies.token 
          || req.body.token||authorizationHeader ? authorizationHeader.replace("Bearer", "").trim() : null;
          // || req.header("Authorization").replace("Bearer"," ");

          //if token missing ,then return response
          console.log("token",token);
          if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
          }
          //verify the token
          try{
            
           console.log(token);
           console.log(process.env.JWT_SECRET);
                  const decode= jwt.verify(token,process.env.JWT_SECRET);
                   console.log("decode",decode);
                  req.user=decode;
          }
          catch(error){
                  //verification -issue
                  console.log(error);
                  return res.status(401).json({
                    success:false,
                    message:'token is invalid',
                  });
          }
          next();
    }
    catch(error){
          return res.status(401).json({
            success:false,
            message:'Something went wrong while validation the token',
          })
    }
}

//isstudent
exports.isStudent=async(req,res,next)=>{
    try{
              if(req.user.accountType!=="Student"){
                return res.status(401).json({
                    success:false,
                    message:'This is a prtected route for students only',
                })
              }
              next();
    }
    catch(error){
           return res.status(500).json({
            success:false,
            message:'User role cannot be verified,please try again'
           })
    }
}

//isinstructor

// exports.isInstructor=async(req,res,next)=>{
//   console.log("hello from auth");
//     try{
//       console.log("userdata",req.user.accountType);
//               if(req.user.accountType!=="Instructor"){
//                 return res.status(401).json({
//                     success:false,
//                     message:'This is a protected route for Instructor only',
//                 })
//               }
              
//               console.log("next");
          
//               next()
             
             
//              console.log("after next");
//              console.log("hello");
            
             
//     }
//     catch(error){
//       console.log("error",error);
//            return res.status(500).json({
//             success:false,
//             message:'User role cannot be verified,please try again'
//            })
//     }
// }

exports.isInstructor = async (req, res, next) => {
  console.log("hello from instructure");
  console.log(req.user);
  try{
         if(req.user.accountType !== "Instructor") {
             return res.status(401).json({
                 success:false,
                 message:'This is a protected route for Instructor only',
             });
         }
         try{
         await next();
         }
         catch(error){
          console.log("error",error);
         }
       
  }
  catch(error) {
     return res.status(500).json({
         success:false,
         message:'User role cannot be verified, please try again'
     })
  }
 }

//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
              if(req.user.accountType!=="Admin"){
                return res.status(401).json({
                    success:false,
                    message:'This is a prtected route for admin only',
                })
              }
              next();
    }
    catch(error){
           return res.status(500).json({
            success:false,
            message:'User role cannot be verified,please try again'
           })
    }
}