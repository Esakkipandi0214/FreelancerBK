// import nodemailer from 'nodemailer';
// import { Resend } from 'resend';

// const resend = new Resend(`${process.env.EMAIL_USER}`);

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'praveenpandian01@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });

// // Configure transporter with your email service credentials
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com', // example for Gmail SMTP
//   port: 587,
//   secure: false,
//   auth: {
//     user: `${process.env.EMAIL_USER}`, // your email (set in .env)
//     pass: `${process.env.EMAIL_PASS}`, // your email password or app password
//   },
//   tls: {
//     rejectUnauthorized: false, // ⚠️ disables certificate validation
//   },
// });

// // Send OTP Email
// export const sendOtpEmail = async (to: string, otp: string) => {
//   const mailOptions = {
//     from: `"Your App Name" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
//     html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending OTP email:', error);
//     throw error;
//   }
// };

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendOtpEmail = async (to: string, otp: string) => {
  try {
    const email = await resend.emails.send({
      from: `Resend <onboarding@resend.dev>`, // sender email verified in Resend
      to,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
    console.log("Email sent:", email);
  } catch (err) {
    console.error("Error sending OTP email:", err);
    throw err;
  }
};
