import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite
} from '../controllers/favoriteController.js';
import { authenticate, requireUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireUser);

router.post('/:planId', addFavorite);
router.delete('/:planId', removeFavorite);
router.get('/', getUserFavorites);
router.get('/check/:planId', checkFavorite);

export default router;
