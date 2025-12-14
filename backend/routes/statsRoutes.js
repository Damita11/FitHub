import express from 'express';
import { getTrainerStats } from '../controllers/statsController.js';
import { authenticate, requireTrainer } from '../middleware/auth.js';

const router = express.Router();

router.get('/trainer', authenticate, requireTrainer, getTrainerStats);

export default router;
