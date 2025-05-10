import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { invoices: true }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/', async (req, res) => {
  const { name, contact, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
      },
      include: {
        invoices: true
      }
    });

    // Format the response to match frontend expectations
    const formattedClient = {
      ...client,
      contact: contact || '',
      projects: 0,
      totalBilled: "$0.00"
    };

    res.status(201).json(formattedClient);
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: 'Failed to create client' });
  }
});

// Add update endpoint
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone },
      include: { invoices: true }
    });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ error: 'Failed to update client' });
  }
});

// Add delete endpoint
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.client.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(400).json({ error: 'Failed to delete client' });
  }
});

export default router;