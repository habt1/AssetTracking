// config.js
module.exports = {
    awsConfig: {
      region: process.env.REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Store in environment variables for security
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // Store in environment variables for security
    }
  };
  