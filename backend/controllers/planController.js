import prisma from '../config/database.js';
import { validationResult } from 'express-validator';

export const createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, duration } = req.body;

    // Get trainer profile
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    const plan = await prisma.fitnessPlan.create({
      data: {
        trainerId: trainer.id,
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await prisma.fitnessPlan.findMany({
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return preview data for all plans (public view)
    const previewPlans = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      price: plan.price,
      duration: plan.duration,
      trainerName: plan.trainer.user.name,
      trainerId: plan.trainer.id,
      subscriberCount: plan._count.subscriptions,
      createdAt: plan.createdAt
    }));

    res.json({ plans: previewPlans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional, user might not be authenticated

    const plan = await prisma.fitnessPlan.findUnique({
      where: { id },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user has active subscription
    let hasAccess = false;
    if (userId) {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          planId: id,
          status: 'ACTIVE',
          expiresAt: {
            gte: new Date()
          }
        }
      });
      hasAccess = !!subscription;
    }

    // Return preview or full data based on access
    if (hasAccess) {
      res.json({ 
        plan: {
          ...plan,
          trainerName: plan.trainer.user.name,
          trainerId: plan.trainer.id
        },
        hasAccess: true 
      });
    } else {
      res.json({
        plan: {
          id: plan.id,
          title: plan.title,
          price: plan.price,
          duration: plan.duration,
          trainerName: plan.trainer.user.name,
          trainerId: plan.trainer.id,
          createdAt: plan.createdAt
        },
        hasAccess: false
      });
    }
  } catch (error) {
    console.error('Get plan by id error:', error);
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
};

export const getTrainerPlans = async (req, res) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    const plans = await prisma.fitnessPlan.findMany({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ plans });
  } catch (error) {
    console.error('Get trainer plans error:', error);
    res.status(500).json({ message: 'Error fetching trainer plans', error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, price, duration } = req.body;

    // Get trainer profile
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    // Check if plan exists and belongs to trainer
    const existingPlan = await prisma.fitnessPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (existingPlan.trainerId !== trainer.id) {
      return res.status(403).json({ message: 'Not authorized to update this plan' });
    }

    const plan = await prisma.fitnessPlan.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Get trainer profile
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    // Check if plan exists and belongs to trainer
    const existingPlan = await prisma.fitnessPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (existingPlan.trainerId !== trainer.id) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await prisma.fitnessPlan.delete({
      where: { id }
    });

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};
