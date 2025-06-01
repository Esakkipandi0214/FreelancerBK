import { Router } from 'express';
import prisma from '../lib/prisma';


const router = Router();

router.post('/create', async (req, res) => {
  const { expenseCategory,userId,paymentMethod, Notes,expenseAmount, budgetId } = req.body;

  if (!expenseCategory || !expenseAmount  || !userId) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const User_Income = await prisma.user_Expense.create({
      data: {
        expenseCategory,
        Notes:Notes?? null,
        paymentMethod:paymentMethod??"OTHER",
        expenseAmount,
        budgetId:budgetId || null,
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


router.get('/get-expense/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const budgets = await prisma.user_Expense.findMany({
      where: { userId }
    });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

export default router;
