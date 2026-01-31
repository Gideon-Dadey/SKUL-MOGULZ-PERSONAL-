import express from 'express';
import { getProjects, getBookmarkedProjects, getProjectById, createProject, likeProject, toggleBookmark, commentProject, likeComment, replyComment, supportProject, deleteProject, updateProject, repostProject } from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getProjects);
router.get('/bookmarked', protect, getBookmarkedProjects);
router.get('/:id', getProjectById);
router.post('/', protect, upload.array('media', 5), createProject);
router.put('/:id/like', protect, likeProject);
router.put('/:id/repost', protect, repostProject);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, commentProject);
router.put('/:id/comment/:commentId/like', protect, likeComment);
router.post('/:id/comment/:commentId/reply', protect, replyComment);
router.post('/:id/support', protect, supportProject);
router.route('/:id').delete(protect, deleteProject).put(protect, upload.array('media', 5), updateProject);

export default router;
