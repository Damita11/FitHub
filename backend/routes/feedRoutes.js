import express from 'express';
import { getPersonalizedFeed } from '../controllers/feedController.js';
import { authenticate, requireUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireUser, getPersonalizedFeed);

export default router;
