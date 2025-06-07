import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Create a new budget plan
router.post('/create', async (req, res) => {
  const { Budget_Name, Budget_Type, userId, Total_Budget, Plan_Status, budgetStartDate, budgetEndDate } = req.body;

  if (!Budget_Name || !Budget_Type || !userId || !Total_Budget || !Plan_Status || !budgetStartDate || !budgetEndDate) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existing_user = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing_user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  try {
    const newBudget = await prisma.budget_Planner.create({
      data: {
        Budget_Name,
        Budget_Type,
        userId,
        Total_Budget:Number(Total_Budget),
        Plan_Status,
        Spend_Budget:0,
        Remainnig_Budget:Number(Total_Budget),
        budgetStartDate: new Date(budgetStartDate),
        budgetEndDate: new Date(budgetEndDate),
      },
    });

    res.status(201).json({ message: 'Budget created successfully.', budget: newBudget });
  } catch (error: any) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget.' });
  }
});

// Get all budget plans for a user
router.get('/get-budget/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const existing_user = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing_user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const budgets = await prisma.budget_Planner.findMany({
      where: { userId },
    });

     if (!budgets) {
  return res.status(404).json({ message: "Budget not found" });
}

    // Calculate status counts
const statusCounts = budgets.reduce(
  (acc, budget) => {
    acc.TotalBudgets += 1;
    const status = budget.Plan_Status;

    if (status === 'Planning') acc.Planning += 1;
    else if (status === 'InProgress') acc.InProgress += 1;
    else if (status === 'Completed') acc.Completed += 1;
    else if (status === 'Cancelled') acc.Cancelled += 1;

    return acc;
  },
  {
    TotalBudgets: 0,
    Planning: 0,
    InProgress: 0,
    Completed: 0,
    Cancelled: 0,
  }
);


    res.status(200).json({ budgets,summary: statusCounts, });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

// Get all budget plans for a user
router.get('/get-budget/:userId/:budgetPlanId', async (req, res) => {
  const { userId,budgetPlanId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const existing_user = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing_user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedBudget = await prisma.budget_Planner.findUnique({
      where: { userId:userId,budgetPlanId:budgetPlanId },
       include: { expenses: true },
    });

    if (!updatedBudget) {
  return res.status(404).json({ message: "Budget not found" });
}

    res.status(200).json({updatedBudget});
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

// Update a specific budget plan
router.put('/update-budget/:budgetPlanId/:userId', async (req, res) => {
  const { budgetPlanId, userId } = req.params;
  const { Budget_Name, Budget_Type, Total_Budget, Plan_Status, budgetStartDate, budgetEndDate } = req.body;

  if (!budgetPlanId || !userId) {
    return res.status(400).json({ message: 'Access credentials missing.' });
  }

  try {
    const existing_user = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing_user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existing_budget = await prisma.budget_Planner.findUnique({ where: { budgetPlanId } });
    if (!existing_budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    const updatedBudget = await prisma.budget_Planner.update({
      where: { budgetPlanId },
      data: {
        Budget_Name: Budget_Name ?? existing_budget.Budget_Name,
        Budget_Type: Budget_Type ?? existing_budget.Budget_Type,
        Total_Budget: Total_Budget ?? existing_budget.Total_Budget,
        Plan_Status: Plan_Status ?? existing_budget.Plan_Status,
        budgetStartDate: budgetStartDate ? new Date(budgetStartDate) : existing_budget.budgetStartDate,
        budgetEndDate: budgetEndDate ? new Date(budgetEndDate) : existing_budget.budgetEndDate,
      },
    });

    res.status(200).json({ message: 'Budget updated successfully.', budget: updatedBudget });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget.' });
  }
});

// Delete a specific budget plan
router.delete('/delete-budget/:budgetPlanId/:userId', async (req, res) => {
  const { budgetPlanId, userId } = req.params;

  if (!budgetPlanId || !userId) {
    return res.status(400).json({ message: 'Access credentials missing.' });
  }

  try {
    const existing_user = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing_user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existing_budget = await prisma.budget_Planner.findUnique({ where: { budgetPlanId } });
    if (!existing_budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    await prisma.budget_Planner.delete({ where: { budgetPlanId } });

    res.status(200).json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget.' });
  }
});

export default router;
