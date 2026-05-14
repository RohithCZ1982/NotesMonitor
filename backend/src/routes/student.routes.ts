import { Router } from 'express';
import { authenticate, requireStudent } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getStudentFolders,
  getFolderById,
  trackDownload,
  studentDownloadZip,
  getStudentProfile,
} from '../controllers/student.controller';
import { trackDownloadSchema } from '../schemas/validation.schemas';

const router = Router();
router.use(authenticate, requireStudent);

router.get('/folders', asyncHandler(getStudentFolders));
router.get('/folders/:folderId', asyncHandler(getFolderById));
router.post('/folders/:folderId/track-download', validate(trackDownloadSchema), asyncHandler(trackDownload));
router.get('/folders/:folderId/download-zip', asyncHandler(studentDownloadZip));
router.get('/profile', asyncHandler(getStudentProfile));

export default router;
