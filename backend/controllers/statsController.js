import prisma from '../config/database.js';

export const getTrainerStats = async (req, res) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    // Get all plans
    const plans = await prisma.fitnessPlan.findMany({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    // Get all subscriptions
    const planIds = plans.map(p => p.id);
    const subscriptions = await prisma.subscription.findMany({
      where: {
        planId: { in: planIds }
      }
    });

    // Calculate statistics
    const totalPlans = plans.length;
    const totalSubscribers = subscriptions.length;
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      const plan = plans.find(p => p.id === sub.planId);
      return sum + (plan ? parseFloat(plan.price) : 0);
    }, 0);

    const activeSubscriptions = subscriptions.filter(
      sub => sub.status === 'ACTIVE' && new Date(sub.expiresAt) >= new Date()
    ).length;

    const followers = await prisma.follow.count({
      where: { trainerId: trainer.id }
    });

    // Revenue by month (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthSubs = subscriptions.filter(sub => {
        const subDate = new Date(sub.purchasedAt);
        return subDate >= monthStart && subDate <= monthEnd;
      });

      const revenue = monthSubs.reduce((sum, sub) => {
        const plan = plans.find(p => p.id === sub.planId);
        return sum + (plan ? parseFloat(plan.price) : 0);
      }, 0);

      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue: revenue
      });
    }

    // Top performing plans
    const topPlans = plans
      .map(plan => ({
        id: plan.id,
        title: plan.title,
        subscribers: plan._count.subscriptions,
        revenue: subscriptions
          .filter(sub => sub.planId === plan.id)
          .reduce((sum, sub) => sum + parseFloat(plan.price), 0)
      }))
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 5);

    res.json({
      stats: {
        totalPlans,
        totalSubscribers,
        activeSubscriptions,
        totalRevenue: totalRevenue.toFixed(2),
        followers,
        averagePlanPrice: totalPlans > 0 
          ? (plans.reduce((sum, p) => sum + parseFloat(p.price), 0) / totalPlans).toFixed(2)
          : 0
      },
      monthlyRevenue,
      topPlans
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};
