import prisma from '../config/database.js';

export const addFavorite = async (req, res) => {
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

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_planId: {
          userId,
          planId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Plan already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        planId
      },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_planId: {
          userId,
          planId
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: {
        userId_planId: {
          userId,
          planId
        }
      }
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
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
        createdAt: 'desc'
      }
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_planId: {
          userId,
          planId
        }
      }
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Error checking favorite', error: error.message });
  }
};
