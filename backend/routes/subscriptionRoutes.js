import express from 'express';
import {
  subscribeToPlan,
  getUserSubscriptions,
  getSubscriptionById
} from '../controllers/subscriptionController.js';
import { authenticate, requireUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and user role
router.use(authenticate);
router.use(requireUser);

router.post('/:planId', subscribeToPlan);
router.get('/', getUserSubscriptions);
router.get('/:id', getSubscriptionById);

export default router;
