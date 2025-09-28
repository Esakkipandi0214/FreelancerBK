import nodemailer from 'nodemailer';

// Configure transporter with your email service credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // example for Gmail SMTP
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.EMAIL_USER}`, // your email (set in .env)
    pass: `${process.env.EMAIL_PASS}`, // your email password or app password
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ disables certificate validation
  },
});

// Send OTP Email
export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
