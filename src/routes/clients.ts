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
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, email, phone }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create client' });
  }
});

export default router;