import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const requireTrainer = async (req, res, next) => {
  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Trainer access required' });
  }
  next();
};

export const requireUser = async (req, res, next) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({ message: 'User access required' });
  }
  next();
};

// Optional authentication - doesn't fail if no token, but sets req.user if valid token is provided
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(); // No token, continue without setting req.user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (user) {
      req.user = user;
    }
    // If user not found, just continue without req.user (don't fail)
    next();
  } catch (error) {
    // If token is invalid/expired, just continue without req.user (don't fail)
    next();
  }
};
