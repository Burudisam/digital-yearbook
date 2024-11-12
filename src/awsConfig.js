import AWS from 'aws-sdk';

// Initialize the Rekognition service
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2', 
});

const rekognition = new AWS.Rekognition();
export default rekognition;
