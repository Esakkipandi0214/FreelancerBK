import { Router } from 'express';
import prisma from '../lib/prisma';


const router = Router();

router.post('/create', async (req, res) => {
  const { incomeCategory,userId, Notes,incomeAmount,paymentMethod,paymentType, budgetId } = req.body;

  if (!incomeCategory || !incomeAmount  || !userId) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
      const existing_user = await prisma.user.findUnique({ where: { id: userId } });
      if(budgetId){
         const budgets = await prisma.budget_Details.findUnique({where: { budgetId }});
         if(!budgets){
      res.status(404).json({message:"Budget not found"})
    }
      }
     
    if (!existing_user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    

    const User_Income = await prisma.user_Income.create({
      data: {
        incomeCategory ,
        incomeAmount,
        paymentMethod:paymentMethod??"OTHER",
        PaymentType:paymentType,
        budgetId:budgetId || null,
        Notes:Notes ?? null,
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


router.get('/get-income/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const budgets = await prisma.user_Income.findMany({
      where: { userId }
    });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

export default router;
