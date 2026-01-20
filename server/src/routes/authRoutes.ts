import express from 'express';
import { register, login, getMe, getUserProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile/:username', getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
