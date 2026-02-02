import express from 'express';
import {
    askHurdle,
    getHurdles,
    answerHurdle,
    logMilestone,
    getMilestones,
    endorseSkill
} from '../controllers/arenaController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Hurdles
router.route('/hurdles')
    .post(protect, askHurdle)
    .get(getHurdles);
router.post('/hurdles/:id/answer', protect, answerHurdle);

// Milestones
router.route('/milestones')
    .post(protect, logMilestone)
    .get(getMilestones);

// Endorsements
router.post('/endorse', protect, endorseSkill);

export default router;
