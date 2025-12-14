import prisma from '../config/database.js';

export const subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    // Check if plan exists
    const plan = await prisma.fitnessPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        planId: planId,
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription to this plan' });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // Create subscription (simulated payment - no real gateway)
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        expiresAt,
        status: 'ACTIVE'
      },
      include: {
        plan: {
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
        }
      }
    });

    res.status(201).json({
      message: 'Subscription successful',
      subscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Error subscribing to plan', error: error.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: {
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
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });

    // Update expired subscriptions
    const now = new Date();
    const updatedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        if (sub.expiresAt < now && sub.status === 'ACTIVE') {
          return await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'EXPIRED' },
            include: {
              plan: {
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
              }
            }
          });
        }
        return sub;
      })
    );

    res.json({ subscriptions: updatedSubscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: {
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
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this subscription' });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription by id error:', error);
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};
