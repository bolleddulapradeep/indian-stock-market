var axios = require("axios");
const getEmailValidated = async (email) => {
    try {
        const response = await axios.get(`http://api.quickemailverification.com/v1/verify?email=${email}&apikey=${process.env.QUICK_EMAIL_VERIFICATION}`);
        return response.data.result;
    } catch (error) {
        return new Error('No Internet Connection...! Please check');
    }
}

module.exports = getEmailValidated;