import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where:{ isActive: true},
      include: { invoices: true }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET CLIENTS by userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const clients = await prisma.client.findMany({
      where: { userId , isActive: true},
      include: { invoices: true }, // include related invoices
    });

    // Map and transform clients before sending response
    const mappedClients = clients.map((client: any) => {
        const projects = client.invoices.length;
        const PayBill = client.invoices.reduce(
          (acc: number, invoice: any) => acc + Number(invoice.amount || 0),
          0
        );
        const totalBilled = client.invoices.reduce(
          (acc: number, invoice: any) => acc + Number(invoice.paidAmount || 0),
          0
        );
        return {
          id: client.clientId,
          name: client.name,
          contact: client.contact || "N/A",
          email: client.email,
          phone: client.phone,
          projects,
          totalBilled: `$${totalBilled.toFixed(2)}`,
          PayBill:`$${PayBill.toFixed(2)}`
        };
      });
    res.json(mappedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients by userId' });
  }
});


// GET CLIENTS by userId
router.get('/user/:userId/ClientCatogories', async (req, res) => {
  const { userId } = req.params;

  try {
    const clients = await prisma.client.findMany({
      where: { userId , isActive: true},
      include: { invoices: true }, // include related invoices
    });

    // Map and transform clients before sending response
    const mappedClients = clients.map((client: any) => {
        const projects = client.invoices.length;
        const totalBilled = client.invoices.reduce(
          (acc: number, invoice: any) => acc + Number(invoice.amount || 0),
          0
        );
        return {
          id: client.clientId,
          name: client.name,
        };
      });
    res.json(mappedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients by userId' });
  }
});



// GET CLIEND BY ID
router.get('/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const { name, email, phone } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { clientId , isActive: true},
    });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ error: 'Failed to update client' });
  }
});

// POST create new client
router.post('/', async (req, res) => {
  const { name, contact, email, phone, userId } = req.body;

  if (!name || !email || !userId) {
    return res.status(400).json({ error: 'Name, email, and userId are required' });
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        userId, // ensure userId is passed and related
      },
      include: {
        invoices: true
      }
    });

    // Optional: front-end formatting
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

// PUT update client
router.put('/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const { name, email, phone } = req.body;

  try {
    const client = await prisma.client.update({
      where: { clientId , isActive: true},
      data: { name, email, phone },
      include: { invoices: true }
    });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ error: 'Failed to update client' });
  }
});

// DELETE client
router.delete('/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
     await prisma.client.update({
      where: {clientId },
      data: { isActive: false }, // 👈 just mark inactive
    });
    res.status(200).json({message:"Client Deleted Successfully"});
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(400).json({ error: 'Failed to delete client' });
  }
});

export default router;
