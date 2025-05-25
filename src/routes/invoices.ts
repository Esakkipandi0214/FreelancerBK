import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET invoices by userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        client: {
          userId: userId,
          isActive:true
        }
      },
      include: { client: true }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices by userId:', error);
    res.status(500).json({ error: 'Failed to fetch invoices by userId' });
  }
});

// GET invoices by clientId
router.get('/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: clientId
      },
      include: { client: true }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices by clientId:', error);
    res.status(500).json({ error: 'Failed to fetch invoices by clientId' });
  }
});

// POST create invoice
router.post('/', async (req, res) => {
  const { clientId, amount, status, dueDate } = req.body;

  if (!clientId || !amount || !status || !dueDate) {
    return res.status(400).json({ error: 'Missing required invoice fields' });
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        amount,
        paidAmount:0,
        status,
        dueDate: new Date(dueDate)
      },
       include: { client: true}
    });

    res.status(201).json({message:"Invoice created Successfully"});
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ error: 'Failed to create invoice' });
  }
});

// PUT update invoice by ID (only update provided fields)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, paidAmount, status, dueDate } = req.body;

  try {
    // 1. Validate required fields (optional)
    if (!amount || !paidAmount || !status || !dueDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 2. Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // 3. Update with everything from frontend
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        amount,
        paidAmount,
        status,
        dueDate: new Date(dueDate), // make sure date string is converted
      },
      include: { client: true },
    });

    res.status(200).json({message:"Invoice updated Successfully"});
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(400).json({ error: 'Failed to update invoice' });
  }
});



// DELETE invoice
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.invoice.delete({
      where: { id }
    });

     res.status(200).json({message:"Invoice Deleted Successfully"});
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(400).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
