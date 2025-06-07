import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user';
import BudgetRoutes from './routes/BudgetPlanner';
import IncomeRoutes from './routes/UserIncome';
import ExpenseRoutes from './routes/UserExpense';
import UserPaymentRoutes from './routes/UserPayments';
import BudgetUpdatePlanner from './routes/BudgetUpdatePlanner';
import BudgetTracker from './routes/BudgetTracker';





dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/v1/budget', BudgetRoutes);
app.use('/api/v1/income', IncomeRoutes);
app.use('/api/v1/expense', ExpenseRoutes);
app.use('/api/v1/user-payment', UserPaymentRoutes);
app.use('/api/v1/budget-planner', BudgetUpdatePlanner);
app.use('/api/v1/budget-tracker', BudgetTracker);





app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// if (require.main === module) {
//   app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
// }

export default app;