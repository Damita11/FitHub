import prisma from '../config/database.js';

export const followTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const userId = req.user.id;

    // Check if trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Prevent following yourself
    if (trainer.userId === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        userId_trainerId: {
          userId,
          trainerId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }

    const follow = await prisma.follow.create({
      data: {
        userId,
        trainerId
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
      message: 'Successfully followed trainer',
      follow
    });
  } catch (error) {
    console.error('Follow trainer error:', error);
    res.status(500).json({ message: 'Error following trainer', error: error.message });
  }
};

export const unfollowTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const userId = req.user.id;

    const follow = await prisma.follow.findUnique({
      where: {
        userId_trainerId: {
          userId,
          trainerId
        }
      }
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this trainer' });
    }

    await prisma.follow.delete({
      where: {
        userId_trainerId: {
          userId,
          trainerId
        }
      }
    });

    res.json({ message: 'Successfully unfollowed trainer' });
  } catch (error) {
    console.error('Unfollow trainer error:', error);
    res.status(500).json({ message: 'Error unfollowing trainer', error: error.message });
  }
};

export const getFollowingList = async (req, res) => {
  try {
    const userId = req.user.id;

    const following = await prisma.follow.findMany({
      where: { userId },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                plans: true,
                followers: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ following });
  } catch (error) {
    console.error('Get following list error:', error);
    res.status(500).json({ message: 'Error fetching following list', error: error.message });
  }
};

export const getTrainerFollowers = async (req, res) => {
  try {
    // Get trainer profile
    const trainer = await prisma.trainer.findUnique({
      where: { userId: req.user.id }
    });

    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    const followers = await prisma.follow.findMany({
      where: { trainerId: trainer.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ followers });
  } catch (error) {
    console.error('Get trainer followers error:', error);
    res.status(500).json({ message: 'Error fetching followers', error: error.message });
  }
};
