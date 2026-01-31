import express from 'express';
import { register, login, getMe, getUserProfile, updateProfile } from '../controllers/authController';
import { protect, optionalProtect } from '../middleware/authMiddleware';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile/:username', optionalProtect, getUserProfile);
router.put('/profile', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateProfile);

export default router;
