import express from 'express';
import { getTrainerProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/trainer/:trainerId', getTrainerProfile);

export default router;
