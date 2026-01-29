import express from 'express';
import {
    getSuggestions,
    sendConnectionRequest,
    acceptRequest,
    getInvitations,
    searchUsers,
    getNetworkStats,
    rejectRequest,
    getConnections,
    getPublicProfile
} from '../controllers/networkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/suggestions', getSuggestions);
router.get('/invitations', getInvitations);
router.get('/search', searchUsers);
router.get('/stats', getNetworkStats);
router.get('/connections', getConnections);
router.get('/users/:id', getPublicProfile);
router.delete('/request/:requestId', rejectRequest);
router.post('/request', sendConnectionRequest);
router.put('/request/:requestId/accept', acceptRequest);

export default router;
