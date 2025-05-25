import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOtpEmail } from '../lib/mailer';

const router = Router();

// Utility to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register user
router.post('/register', async (req, res) => {
  const { name,email, Phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone:Phone,
        password: hashedPassword,
        otp,
        otpExpiresAt,
      },
    });
    
    const userId = user?.id

    console.log(`Generated OTP for ${email}: ${otp}`); 

    await sendOtpEmail(email, otp);
  
    res.status(201).json({ 
      message: 'User registered. Please verify OTP.', 
      userdata: { name,
        email,
        phone: user.phone,userId} 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp || user.otp !== otp || new Date() > user.otpExpiresAt!) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.isVerified) return res.status(403).json({ error: 'Account not verified' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const name = user.name
    const Email = user.email
    const phone = user.phone

    // res.json({ message: 'Login successful', userId: user.id });
    res.status(201).json({ 
      message: 'Login successful.', 
      userdata: { name,
        email: Email,
        phone,userId: user.id } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update password (after verifying OTP)
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otp || user.otp !== otp || new Date() > user.otpExpiresAt!) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
        isVerified: true,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) return res.status(403).json({ error: 'Account not verified' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    await sendOtpEmail(email, otp);

    console.log(`Forgot Password OTP for ${email}: ${otp}`); // In production, send via email/SMS
    res.json({ message: 'OTP sent for password reset' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) return res.status(403).json({ error: 'Account not verified' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// DELETE /delete-user/:id
router.delete('/delete-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate new OTP and expiry
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user record with new OTP
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});



export default router;
