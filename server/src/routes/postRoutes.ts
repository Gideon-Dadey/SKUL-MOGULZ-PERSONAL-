import express from 'express';
import { createPost, getPosts, likePost, getPostById, updatePost, deletePost, commentPost, toggleBookmark } from '../controllers/postController';
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

router.route('/:id')
    .get(getPostById)
    .put(protect, updatePost)
    .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, commentPost);

export default router;
