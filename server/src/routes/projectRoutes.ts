import express from 'express';
import { getProjects, getProjectById, createProject, likeProject, commentProject, supportProject, deleteProject, updateProject } from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', protect, upload.array('media', 5), createProject);
router.put('/:id/like', protect, likeProject);
router.post('/:id/comment', protect, commentProject);
router.post('/:id/support', protect, supportProject);
router.route('/:id').delete(protect, deleteProject).put(protect, upload.array('media', 5), updateProject);

export default router;
