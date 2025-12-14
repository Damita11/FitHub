import express from 'express';
import { getProgress, updateProgress } from '../controllers/progressController.js';
import { authenticate, requireUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireUser);

router.get('/:planId', getProgress);
router.put('/:planId', updateProgress);

export default router;
