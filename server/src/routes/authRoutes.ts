import express from 'express';
import { register, login, getMe, getUserProfile, updateProfile, deleteAccount, changePassword, changeEmail, toggle2FA, getSessions, revokeSession, updateSettings } from '../controllers/authController';
import { protect, optionalProtect } from '../middleware/authMiddleware';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile/:username', optionalProtect, getUserProfile);
router.put('/profile', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateProfile);
router.delete('/delete', protect, deleteAccount);
router.put('/password', protect, changePassword);
router.put('/email', protect, changeEmail);
router.put('/2fa', protect, toggle2FA);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.put('/settings', protect, updateSettings);

export default router;
