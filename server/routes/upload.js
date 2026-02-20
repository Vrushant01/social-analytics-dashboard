import express from 'express';
import { uploadFile, upload } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/:dashboardId', upload.single('file'), uploadFile);

export default router;
