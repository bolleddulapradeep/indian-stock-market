const AWS = require("aws-sdk");
const ses = new AWS.SES({
  apiVersion: "2010-12-01",
  secretAccessKey: process.env.SECRET,
  accessKeyId: process.env.ID,
  region: "ap-south-1",
});
const verifyEmail = (to,subject, message, from, req, res) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: message,
        },
        /* replace Html attribute with the following if you want to send plain text emails. 
                Text: {
                    Charset: "UTF-8",
                    Data: message
                }
             */
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    // FromEmailAddress: from,
    ReturnPath: from ? from : config.aws.ses.from.default,
    Source: from ? from : config.aws.ses.from.default,
  };

  console.log(params);
  ses.sendEmail(params, (err, data) => {
    if (err) {
      return console.log(err, err.stack);
    } else {
      return "true";
    }
  });
};

module.exports = verifyEmail;