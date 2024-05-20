const { contactUsEmail } = require("../mail/templates/contactFormRes")             //contactUsEmail is the format/style of email which is send to the user;
const mailSender = require("../utils/mailSender")

exports.contactUsController = async (req, res) => {

  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body
  console.log("hello from contact");
  console.log({email},{firstname},{message},{phoneNo});

  try {
    await mailSender( email, "Your Data send successfully", contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode))
    await mailSender( "dedaniyaasmi@gmail.com" , "Someone Send this data to you", contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode))

    return res.json({
      success: true,
      message: "Email send successfully",
    })
  }
   catch (error) {
      return res.json({
        success: false,
        message: "Something went wrong...",
      })
  }
}