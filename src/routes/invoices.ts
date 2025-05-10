import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/', async (req, res) => {
  const { clientId, amount, status, dueDate } = req.body;
  try {
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        amount,
        status,
        dueDate: new Date(dueDate)
      },
      include: { client: true }
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create invoice' });
  }
});

export default router;