import express from 'express';
import {
    getSuggestions,
    sendConnectionRequest,
    acceptRequest,
    getInvitations
} from '../controllers/networkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/suggestions', getSuggestions);
router.get('/invitations', getInvitations);
router.post('/request', sendConnectionRequest);
router.put('/request/:requestId/accept', acceptRequest);

export default router;
