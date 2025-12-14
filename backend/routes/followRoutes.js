import express from 'express';
import {
  followTrainer,
  unfollowTrainer,
  getFollowingList,
  getTrainerFollowers
} from '../controllers/followController.js';
import { authenticate, requireUser } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/:trainerId', authenticate, requireUser, followTrainer);
router.delete('/:trainerId', authenticate, requireUser, unfollowTrainer);
router.get('/following', authenticate, requireUser, getFollowingList);

// Trainer routes (to see their followers)
router.get('/trainer/followers', authenticate, getTrainerFollowers);

export default router;
