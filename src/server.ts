import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRouter from './routes/invoices';
import clientRouter from './routes/clients';
import userRoutes from './routes/user';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/invoices', invoiceRouter);
app.use('/api/clients', clientRouter);
app.use('/api/users', userRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;