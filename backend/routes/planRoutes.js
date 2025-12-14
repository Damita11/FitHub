import express from 'express';
import { body } from 'express-validator';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getTrainerPlans
} from '../controllers/planController.js';
import { authenticate, requireTrainer, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const planValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 day')
];

// Public routes
router.get('/', getPlans);
router.get('/:id', optionalAuthenticate, getPlanById);

// Trainer routes (require authentication and trainer role)
router.post('/', authenticate, requireTrainer, planValidation, createPlan);
router.get('/trainer/my-plans', authenticate, requireTrainer, getTrainerPlans);
router.put('/:id', authenticate, requireTrainer, planValidation, updatePlan);
router.delete('/:id', authenticate, requireTrainer, deletePlan);

export default router;
