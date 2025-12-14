import prisma from '../config/database.js';

export const getProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    // Check if user has subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        planId,
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        plan: true
      }
    });

    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription for this plan' });
    }

    // Get or create progress
    let progress = await prisma.progress.findFirst({
      where: {
        userId,
        planId
      }
    });

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId,
          planId,
          totalDays: subscription.plan.duration,
          completedDays: 0,
          completedDaysList: []
        }
      });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const { day, completed } = req.body;
    const userId = req.user.id;

    // Check if user has subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        planId,
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription for this plan' });
    }

    // Get progress
    let progress = await prisma.progress.findFirst({
      where: {
        userId,
        planId
      }
    });

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId,
          planId,
          totalDays: subscription.plan.duration,
          completedDays: 0,
          completedDaysList: []
        }
      });
    }

    // Update completed days list
    let completedDaysList = (progress.completedDaysList || []).map(String);
    const dayStr = String(day);
    
    if (completed) {
      if (!completedDaysList.includes(dayStr)) {
        completedDaysList.push(dayStr);
      }
    } else {
      completedDaysList = completedDaysList.filter(d => d !== dayStr);
    }

    // Update progress
    progress = await prisma.progress.update({
      where: { id: progress.id },
      data: {
        completedDays: completedDaysList.length,
        completedDaysList: completedDaysList.sort((a, b) => parseInt(a) - parseInt(b))
      }
    });

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
};
