import { Router } from 'express';
import prisma from '../lib/prisma';


const router = Router();

router.post('/create', async (req, res) => {
  const { payementCategory,userId,Notes,paymentMethod, payementTotalAmount,payementPaidAmount,paymentType,paymentStatus, budgetId } = req.body;

  if (!payementCategory || !payementTotalAmount || !paymentStatus || !payementPaidAmount || !paymentType || !userId) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const User_Income = await prisma.user_Payements.create({
      data: {
        payementCategory ,
        paymentMethod:paymentMethod??"OTHER",
        payementTotalAmount,
        payementPaidAmount,
        paymentType,
        Notes:Notes ?? null,
        paymentStatus,
        userId,
      },
    });
  
    res.status(201).json({ 
      message: 'User registered. Please verify OTP.', 
      Income_details: User_Income
  });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});


router.get('/get-user-payments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const budgets = await prisma.user_Payements.findMany({
      where: { userId }
    });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

export default router;
