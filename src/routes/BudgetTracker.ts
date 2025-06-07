import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Create a new spend tracker entry
// Create a new spend tracker entry
router.post('/create-spend', async (req, res) => {
  const { expense_Description, expense_Category, budgetPlanId, expense_amount, pay_time } = req.body;

  if (!expense_Description || !expense_Category || !budgetPlanId || !expense_amount || !pay_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const budgets = await prisma.budget_Planner.findUnique({
      where: { budgetPlanId },
      include: { expenses: true },
    });

    if (!budgets) {
      return res.status(404).json({ message: 'Associated budget plan not found.' });
    }

    const { Total_Budget, Spend_Budget, Remainnig_Budget } = budgets;

    if (expense_amount > Remainnig_Budget) {
      return res.status(400).json({ message: "Expense amount exceeds remaining budget." });
    }

    // Create new expense
    const newSpend = await prisma.budget_Planner_SpendTracker.create({
      data: {
        expense_Description,
        expense_Category,
        budgetPlanId,
        expense_amount,
        pay_time: new Date(pay_time),
        isExpense_Paid: false,
      },
    });

    // Update budget totals
    const updatedBudget = await prisma.budget_Planner.update({
      where: { budgetPlanId },
      data: {
        Spend_Budget: Spend_Budget + expense_amount,
        Remainnig_Budget: Total_Budget - (Spend_Budget + expense_amount),
      },
    });

    res.status(201).json({ message: 'Spend entry created successfully.', spend: newSpend });
  } catch (error) {
    console.error('Create spend error:', error);
    res.status(500).json({ error: 'Failed to create spend entry.' });
  }
});

// Get all spend tracker entries for a budget
router.get('/get-spends/:budgetPlanId', async (req, res) => {
  const { budgetPlanId } = req.params;

  if (!budgetPlanId) {
    return res.status(400).json({ message: 'Budget plan ID is required.' });
  }

  try {
    const spends = await prisma.budget_Planner_SpendTracker.findMany({
      where: { budgetPlanId },
    });

    res.status(200).json({ spends });
  } catch (error) {
    console.error('Get spends error:', error);
    res.status(500).json({ error: 'Failed to fetch spend entries.' });
  }
});

// Update a spend tracker entry
router.put('/update-spend/:spendTrackerId', async (req, res) => {
  const { spendTrackerId } = req.params;
  const { expense_Description, expense_Category, expense_amount, pay_time, isExpense_Paid } = req.body;

  if (!spendTrackerId) {
    return res.status(400).json({ message: 'Spend Tracker ID is required.' });
  }

  try {
    const existing_spend = await prisma.budget_Planner_SpendTracker.findUnique({ where: { SpendTrackerId: spendTrackerId } });
    if (!existing_spend) {
      return res.status(404).json({ message: 'Spend entry not found.' });
    }

    const updatedSpend = await prisma.budget_Planner_SpendTracker.update({
      where: { SpendTrackerId: spendTrackerId },
      data: {
        expense_Description: expense_Description ?? existing_spend.expense_Description,
        expense_Category: expense_Category ?? existing_spend.expense_Category,
        expense_amount: expense_amount ?? existing_spend.expense_amount,
        pay_time: pay_time ? new Date(pay_time) : existing_spend.pay_time,
        isExpense_Paid: isExpense_Paid ?? existing_spend.isExpense_Paid
      }
    });

    res.status(200).json({ message: 'Spend entry updated successfully.', spend: updatedSpend });
  } catch (error) {
    console.error('Update spend error:', error);
    res.status(500).json({ error: 'Failed to update spend entry.' });
  }
});

// Delete a spend tracker entry
router.delete('/delete-spend/:spendTrackerId', async (req, res) => {
  const { spendTrackerId } = req.params;

  if (!spendTrackerId) {
    return res.status(400).json({ message: 'Spend Tracker ID is required.' });
  }

  try {
    const existing_spend = await prisma.budget_Planner_SpendTracker.findUnique({ where: { SpendTrackerId: spendTrackerId } });
    if (!existing_spend) {
      return res.status(404).json({ message: 'Spend entry not found.' });
    }

    await prisma.budget_Planner_SpendTracker.delete({ where: { SpendTrackerId: spendTrackerId } });

    res.status(200).json({ message: 'Spend entry deleted successfully.' });
  } catch (error) {
    console.error('Delete spend error:', error);
    res.status(500).json({ error: 'Failed to delete spend entry.' });
  }
});

export default router;
