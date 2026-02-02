import express from 'express';
import { createPost, getPosts, likePost } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.route('/')
    .get(getPosts)
    .post(protect, upload.array('media', 4), createPost);

router.put('/:id/like', protect, likePost);

export default router;
