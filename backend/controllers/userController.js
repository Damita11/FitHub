import prisma from '../config/database.js';

export const getTrainerProfile = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const userId = req.user?.id; // Optional, might not be authenticated

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        plans: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            createdAt: true,
            _count: {
              select: {
                subscriptions: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            followers: true,
            plans: true
          }
        }
      }
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Check if current user is following this trainer
    let isFollowing = false;
    if (userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          userId_trainerId: {
            userId,
            trainerId
          }
        }
      });
      isFollowing = !!follow;
    }

    res.json({
      trainer: {
        id: trainer.id,
        name: trainer.user.name,
        email: trainer.user.email,
        certification: trainer.certification,
        bio: trainer.bio,
        specialization: trainer.specialization,
        plans: trainer.plans,
        stats: {
          followers: trainer._count.followers,
          plans: trainer._count.plans
        },
        isFollowing
      }
    });
  } catch (error) {
    console.error('Get trainer profile error:', error);
    res.status(500).json({ message: 'Error fetching trainer profile', error: error.message });
  }
};
