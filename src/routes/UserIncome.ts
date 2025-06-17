import { Router } from 'express';
import prisma from '../lib/prisma';


const router = Router();

router.post('/create', async (req, res) => {
  const { userId, Notes,incomeAmount,Expense_Type,Expense_Category,paymentMethod,paymentType, budgetId } = req.body;

  if (!incomeAmount  || !userId || !paymentType) {
    return res.status(400).json({ error: 'Missing Income required fields' });
  }

  const data:any = {
        incomeAmount,
        paymentMethod:paymentMethod??"OTHER",
        PaymentType:paymentType,
        budgetId:budgetId || null,
        Notes:Notes ?? null,
        userId
      }

  if (paymentType === "Expense" && (!Expense_Type || !Expense_Category )) {
    return res.status(400).json({ error: 'Expense Type Details are mandatory' });
  }

  if (paymentType === "Expense") {
  data.Expense_Category = Expense_Category;
  data.Expense_Type = Expense_Type;
} else {
  data.Expense_Category = null;
  data.Expense_Type = null;
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
      data
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

// router.get('/get-income/rule/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const budgets = await prisma.user_Income.findMany({
//       where: { userId }
//     });

//     const totalIncome = budgets
//       .filter(b => b.PaymentType === "Income")
//       .reduce((sum, item) => sum + item.incomeAmount, 0);

//     const budgetBreakdown = {
//       needs: {
//         percentage: 50,
//         amount: +(totalIncome * 0.5).toFixed(2)
//       },
//       wants: {
//         percentage: 30,
//         amount: +(totalIncome * 0.3).toFixed(2)
//       },
//       savings: {
//         percentage: 20,
//         amount: +(totalIncome * 0.2).toFixed(2)
//       }
//     };

//     res.status(200).json({
//       totalIncome,
//       budgetBreakdown,
//       budgets
//     });
//   } catch (error) {
//     console.error('Get budgets error:', error);
//     res.status(500).json({ error: 'Failed to fetch budgets' });
//   }
// });

router.get('/get-income/rule/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const budgets = await prisma.user_Income.findMany({
      where: { userId }
    });

    // Total Income Calculation
    const totalIncome = budgets
      .filter(b => b.PaymentType === "Income")
      .reduce((sum, item) => sum + item.incomeAmount, 0);

    const budgetBreakdown = {
      needs: {
        percentage: 50,
        amount: +(totalIncome * 0.5).toFixed(2)
      },
      wants: {
        percentage: 30,
        amount: +(totalIncome * 0.3).toFixed(2)
      },
      savings: {
        percentage: 20,
        amount: +(totalIncome * 0.2).toFixed(2)
      }
    };

    // Total Expenses
    const expenses = budgets.filter(b => b.PaymentType === "Expense");
    const totalExpense = expenses.reduce((sum, item) => sum + item.incomeAmount, 0);

    // Group by Expense_Type
    const expenseGroup: Record<string, number> = {};
    for (const expense of expenses) {
      const type = expense.Expense_Type ?? "OTHER";
      expenseGroup[type] = (expenseGroup[type] || 0) + expense.incomeAmount;
    }

    // Build expense breakdown by % of total income
    const expenseBreakdown: Record<string, { amount: number; percentageOfIncome: number }> = {};
    for (const [type, amount] of Object.entries(expenseGroup)) {
      expenseBreakdown[type] = {
        amount: +amount.toFixed(2),
        percentageOfIncome: totalIncome ? +((amount / totalIncome) * 100).toFixed(2) : 0
      };
    }

    // Final response
    res.status(200).json({
      totalIncome,
      budgetBreakdown,
      expenseBreakdown: {
        totalExpense: +totalExpense.toFixed(2),
        totalExpensePercentage: totalIncome ? +((totalExpense / totalIncome) * 100).toFixed(2) : 0,
        ...expenseBreakdown
      },
      budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});



export default router;
