import express from 'express';
import { register, login, getMe, getUserProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile/:username', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
