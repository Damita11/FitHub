import prisma from '../config/database.js';

export const searchPlans = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, duration, sortBy = 'newest' } = req.query;

    let where = {};
    
    // Text search (MongoDB uses regex for case-insensitive search)
    if (q) {
      const searchRegex = { $regex: q, $options: 'i' };
      where.OR = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Duration filter
    if (duration) {
      where.duration = parseInt(duration);
    }

    // Sort options (MongoDB doesn't support nested sorting like Prisma, so we'll sort in memory for popular)
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-low') orderBy = { price: 'asc' };
    if (sortBy === 'price-high') orderBy = { price: 'desc' };

    const plans = await prisma.fitnessPlan.findMany({
      where,
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
      orderBy
    });

    let previewPlans = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      price: plan.price,
      duration: plan.duration,
      trainerName: plan.trainer.user.name,
      trainerId: plan.trainer.id,
      subscriberCount: plan._count.subscriptions,
      createdAt: plan.createdAt
    }));

    // Sort by popularity if needed (MongoDB doesn't support nested count sorting)
    if (sortBy === 'popular') {
      previewPlans.sort((a, b) => b.subscriberCount - a.subscriberCount);
    }

    res.json({ plans: previewPlans, total: previewPlans.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching plans', error: error.message });
  }
};
