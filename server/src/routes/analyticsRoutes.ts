import express from 'express';
import { getAnalytics, getLeaderboard } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.get('/', protect, getAnalytics);

export default router;
