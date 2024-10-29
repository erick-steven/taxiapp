 


const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use a valid email service here
  auth: {
    user: 'your-email@example.com', // Your email
  pass: 'cnkc iwri xims wbyh'
  }
});

module.exports = transporter;
