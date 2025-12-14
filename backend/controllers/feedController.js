import prisma from '../config/database.js';

export const getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all trainers the user follows
    const following = await prisma.follow.findMany({
      where: { userId },
      select: {
        trainerId: true
      }
    });

    const trainerIds = following.map(f => f.trainerId);

    // Get all plans from followed trainers
    const plans = await prisma.fitnessPlan.findMany({
      where: {
        trainerId: {
          in: trainerIds
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user's subscriptions to check which plans they've purchased
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date()
        }
      },
      select: {
        planId: true
      }
    });

    const subscribedPlanIds = new Set(subscriptions.map(s => s.planId));

    // Format feed items with subscription status
    const feedItems = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      trainer: {
        id: plan.trainer.id,
        name: plan.trainer.user.name,
        email: plan.trainer.user.email
      },
      isSubscribed: subscribedPlanIds.has(plan.id),
      createdAt: plan.createdAt
    }));

    res.json({
      feed: feedItems,
      totalPlans: feedItems.length,
      subscribedPlans: feedItems.filter(item => item.isSubscribed).length
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Error fetching feed', error: error.message });
  }
};
