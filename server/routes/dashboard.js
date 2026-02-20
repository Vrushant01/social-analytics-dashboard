import express from 'express';
import {
  createDashboard,
  getDashboards,
  getDashboard,
  updateDashboard,
  deleteDashboard,
} from '../controllers/dashboardController.js';
import { getPosts, updatePost, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/', createDashboard);
router.get('/', getDashboards);
router.get('/:id', getDashboard);
router.put('/:id', updateDashboard);
router.delete('/:id', deleteDashboard);

// Posts routes
router.get('/:dashboardId/posts', getPosts);
router.put('/posts/:postId', updatePost);
router.delete('/posts/:postId', deletePost);

export default router;
