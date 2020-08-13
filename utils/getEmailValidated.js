var axios = require("axios");
const getEmailValidated = async (req,res,next) => {
    console.log(req.body.email)
    try {
        const response = await axios.get(`http://api.quickemailverification.com/v1/verify?email=${req.body.email}&apikey=${process.env.QUICK_EMAIL_VERIFICATION}`);
        console.log(response.data)
        if (response.data.result !== 'valid') {
          return res.status(500).json({status:false,message:'Enter a valid email'}) 
        }
        console.log("Entered email is correct");
        next();
    } catch (error) {
        return new Error('No Internet Connection...! Please check');
    }
}

module.exports = getEmailValidated;