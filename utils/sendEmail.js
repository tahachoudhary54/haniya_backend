import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Using Gmail as per typical configuration for @gmail.com
    auth: {
      user: process.env.Email_id,
      pass: process.env.Email_pass,
    },
  });

  const mailOptions = {
    from: `"Haniya Garments" <${process.env.Email_id}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
