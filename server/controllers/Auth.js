const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
require("dotenv").config();
//send otp
exports.sendOTP=async(req,res)=>{
    try{
        //fetch email from request body
           const {email}=req.body;
           //check if user already exist
           const checkUserPresent=await User.findOne({email});

           //if user alredy exist then return a response
           if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
           }

           //generate otp
           var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
           });
           console.log("OTP generated:",otp);
              //check unique otp or not
              let result=await OTP.findOne({otp:otp});
              while(result){
                otp=otpGenerator(6,{
                    upperCaseAlphabets:false,
                    lowerCaseAlphabets:false,
                    specialChars:false,
                });
                result=await OTP.findOne({otp:otp});
              }
              const otpPayload={email,otp};
              //create an entry for OTP
              const otpBody=await OTP.create(otpPayload);
              console.log(otpBody);

              //return response successfull
              res.status(200).json({
                success:true,
                message:'OTP Sent Successfully',
                otp,
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

//signup
exports.signup=async(req,res)=>{
    //data fetch from body
   try{
    const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body;
    //validate 
    if(!firstName ||! lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fiels are required",
            })
    }
    //2 password match karlo
    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:'password and confirmpassowrd not match'
        });
    }

    //check if user already exist
    const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            })
        }
        //find most recent otp stored for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //validate otp
        if(recentOtp.length==0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:'OTP Found',
            })
        }
        else if(otp!==recentOtp[0].otp){
            //invalid otp
            console.log("otp is",recentOtp[0].otp);
            return res.status(400).json({
                success:false,
                message:"Inavalid OTP",
            });
        }
        //hash password
        const hasedPassword=await bcrypt.hash(password,10);

        //entry create in db
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        const user=await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hasedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });

   }
   catch(error){
           console.log(error);
           return res.status(500).json({
            success:false,
            message:"User cannot be registered .Please try again",
           })  
   }  
}

//login
exports.login=async (req,res)=>{
    try{
        //get data from req body
        const {email,password}=req.body;
        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required,please try again',
            })
        }
        //user exist or not
        let user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not register please signup"
            })
        }
        //generator jwt,after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            console.log(process.env.JWT_SECRET);
            console.log("token from login",token);
            user=user.toObject();
            user.token=token;
            user.password=undefined;
            //create password
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })
        }
        else
        {
            return res.status(401).json({
                success:false,
                message:'password is incorrect',
            })
        }
    }
    catch(error){
       console.log(error);
       return res.status(500).json({
          success:false,
          message:'Login failed please try again'
       })

    }
}

//change password  //written by me
exports. changePassword = async (req, res) => {
	try {
		const userDetails = await User.findById(req.user.id);                         // Get user data from req.user
		const { oldPassword, newPassword, confirmNewPassword } = req.body;            // Get old password, new password, and confirm new password from req.body

		const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password );                 // Validate old password
			 
		if(!isPasswordMatch) {                                  // If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({ success: false, message: "The password is incorrect" });	 
		}

		if(newPassword !== confirmNewPassword) {                             // Match new password and confirm new password
            return res.status(401).json({ success: false, message: "The password and confirm password does not match" });	 
		}
			 
		const encryptedPassword = await bcrypt.hash(newPassword, 10);             // Update password
		const updatedUserDetails = await User.findByIdAndUpdate(req.user.id , { password: encryptedPassword } , { new: true });
                                                                                  // find user by id and then update password = encryptedPassword , here if you "const updatedUserDetails =" does not wirte this then also it not affect;
		 
		try {                                                          // Send notification email , here passwordUpdated is template of email which is send to user;
			const emailResponse = await mailSender(updatedUserDetails.email, passwordUpdated(updatedUserDetails.email, `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`));
			console.log("Email sent successfully:", emailResponse.response);
		   } 
        catch(error) {
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		return res.status(200).json({ success: true, message: "Password updated successfully" });         // Return success response 	 
	 } 
    catch(error) {
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};


