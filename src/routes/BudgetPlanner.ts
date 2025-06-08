import { Router } from 'express';
import prisma from '../lib/prisma';
import { Budget_Details } from '@prisma/client';


const router = Router();

router.post('/create', async (req, res) => {
  const { budgetName,userId, budgetStartDate, budgetEndDate } = req.body;

  if (!budgetName || !userId || !budgetStartDate || !budgetEndDate) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing_user = await prisma.user.findUnique({where:{id:userId}})
  if(!existing_user){
    res.status(404).json({message:"Existing User not found"})
  }
  try {
    const Budget = await prisma.budget_Details.create({
      data: {
        budgetName ,
        userId ,
        budgetStartDate, 
        budgetEndDate
      },
    });
  
    res.status(201).json({ 
      message: 'User registered. Please verify OTP.', 
      Budget_details: Budget
  });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/get-budget/:userId', async (req, res) => {
  const { userId } = req.params;

   if(!userId){
    res.status(400).json({message:"Access Credentials missing"})
  }   
 

  try {
    const existing_user = await prisma.user.findUnique({where:{id:userId}})
      if(!existing_user){
       res.status(404).json({message:"Existing User not found"})
      }

    const budgets = await prisma.budget_Details.findMany({
      where: { userId:userId },
      include: {
        incomes: true
      },
    });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.put('/update-budget/:budgetId/:userId', async (req, res)=>{
  const {budgetId,userId} = req.params;
  const { budgetName,budgetStartDate, budgetEndDate } = req.body;

    if(!budgetId || !userId){
    res.status(400).json({message:"Access Credentials missing"})
  }

 
  try{

     const existing_user = await prisma.user.findUnique({where:{id:userId}})
      if(!existing_user){
       res.status(404).json({message:"Existing User not found"})
      }

    const budgets = await prisma.budget_Details.findUnique({where: { budgetId }});
    if(!budgets){
      res.status(404).json({message:"Budget not found"})
    }
    const updatedBudget = await prisma.budget_Details.update({
      where:{budgetId},
      data:{
        budgetName: budgetName ?? budgets?.budgetName,
        userId:userId,
        budgetStartDate: budgetStartDate ?? budgets?.budgetStartDate,
        budgetEndDate: budgetEndDate ?? budgets?.budgetEndDate
      }
    })

    res.status(200).json({message:"Updated Budget Successfully",Budget:updatedBudget})
  }catch(error){
    console.error("update budget error", error);
    res.status(500).json({error:"Failed to update"})
    
  }
})

router.delete('/delete-budget/:budgetId/:userId', async (req, res)=>{
  const {budgetId,userId} = req.params;

  if(!budgetId || !userId){
    res.status(400).json({message:"Access Credentials missing"})
  }
 
  try{

      const existing_user = await prisma.user.findUnique({where:{id:userId}})
      if(!existing_user){
       res.status(404).json({message:"Existing User not found"})
      }
    
    const existing_budget = await prisma.budget_Details.findUnique({where: { budgetId:budgetId }});

    if(!existing_budget){
      res.status(404).json({message:"Budget not found"})
    }
    const budgets = await prisma.budget_Details.delete({where: { budgetId }});

    res.status(200).json({message:"Deleted Budget Successfully"})
  }catch(error){
    console.error("update budget error", error);
    res.status(500).json({error:"Failed to Delete Budget"})
    
  }
})

export default router;
