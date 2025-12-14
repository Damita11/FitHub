import express from 'express';
import { searchPlans } from '../controllers/searchController.js';

const router = express.Router();

router.get('/plans', searchPlans);

export default router;
