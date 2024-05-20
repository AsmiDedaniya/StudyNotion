const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto=require("crypto");
//resetPasswordToken
exports.resetPasswordToken=async (req,res)=>{
    //get email from body
    try{
        const email=req.body.email;
    //check user for this email,email validation
    const user=await User.findOne({email:email});
    if(!user){
        return res.json({success:false,
        message:'Your Email is not registered with us'});
    }
    //generate token crpto.randomUUID used to create random link
    const token=crypto.randomUUID();
    //update user by adding token and expiry time
    const updatedDetails=await User.findOneAndUpdate(
        {email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+5*0*1000,
        },
        {new:true}
    );
    //create url
    const url=`http://localhost:3000/update-password/${token}`
    //send mail containing the url
    await mailSender(email,"Password Reset Link",
    `Password Reset Link:${url}`);

    //return response
    return res.json({
        success:true,
        message:'Email sent Successfully,plese check email and change password',
    })

    }
    catch(error){
         console.log(error);
         return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset password mail'
         })
    }

}

//resetpassword
exports.resetPassword=async(req,res)=>{
    console.log("hello from reset password");
   try{
          //data fetch
    const {password,confirmPassword,token}=req.body;
    console.log(password);
    console.log(confirmPassword);
    //validation
    if(password!=confirmPassword){
        return res.json({
            success:false,
            message:'Password not matching',
        });
    }
    //get userDetails from db using token
    // const user=await User.findOne({email:email});
     //const userDetails=await user.findOne({token:token});
    // const user = await User.findOne({ email: email });
    // console.log(email);

const userDetails = await User.findOne({ token: token });
    //if no entry-invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid',
        });
    }
    //token time check
    if(userDetails.resetPasswordExpires>Date.now()){
        return res.json({
            success:false,
            message:'Token is expired,please regenerated your token',
        });
    }
    //hash pssword
    const hashedPassword=await bcrypt.hash(password,10);
    //password update
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    );
    //return response
    return res.status(200).json({
        success:true,
        message:'Password reset successful',
    })
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
       success:false,
       message:'Something went wrong while sending reset password mail'
    })
   }
}