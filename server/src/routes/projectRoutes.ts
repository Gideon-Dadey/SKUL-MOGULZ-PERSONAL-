import express from 'express';
import { getProjects, getProjectById, createProject, likeProject, commentProject } from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', protect, createProject);
router.put('/:id/like', protect, likeProject);
router.post('/:id/comment', protect, commentProject);

export default router;
