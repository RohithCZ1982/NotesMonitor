import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getStudents,
  updateStudentStatus,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  removeStudentFromGroup,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFilesToFolder,
  deleteFileFromFolder,
  assignFolderToGroups,
  getReports,
  adminDownloadZip,
} from '../controllers/admin.controller';
import {
  createGroupSchema,
  updateGroupSchema,
  createFolderSchema,
  updateFolderSchema,
  assignFolderSchema,
  updateStudentStatusSchema,
  addStudentsToGroupSchema,
} from '../schemas/validation.schemas';

const router = Router();
router.use(authenticate, requireAdmin);

// ─── Students ───────────────────────────────────────────────────
router.get('/students', asyncHandler(getStudents));
router.patch(
  '/students/:id/status',
  validate(updateStudentStatusSchema),
  asyncHandler(updateStudentStatus)
);

// ─── Groups ─────────────────────────────────────────────────────
router.get('/groups', asyncHandler(getGroups));
router.post('/groups', validate(createGroupSchema), asyncHandler(createGroup));
router.put('/groups/:id', validate(updateGroupSchema), asyncHandler(updateGroup));
router.delete('/groups/:id', asyncHandler(deleteGroup));
router.post(
  '/groups/:id/students',
  validate(addStudentsToGroupSchema),
  asyncHandler(addStudentsToGroup)
);
router.delete(
  '/groups/:id/students/:studentId',
  asyncHandler(removeStudentFromGroup)
);

// ─── Folders ────────────────────────────────────────────────────
router.get('/folders', asyncHandler(getFolders));
router.post('/folders', validate(createFolderSchema), asyncHandler(createFolder));
router.put('/folders/:id', validate(updateFolderSchema), asyncHandler(updateFolder));
router.delete('/folders/:id', asyncHandler(deleteFolder));
router.post(
  '/folders/:folderId/upload',
  upload.array('files', 20),
  asyncHandler(uploadFilesToFolder)
);
router.delete(
  '/folders/:folderId/files/:fileId',
  asyncHandler(deleteFileFromFolder)
);
router.post(
  '/folders/:folderId/assign',
  validate(assignFolderSchema),
  asyncHandler(assignFolderToGroups)
);

// ─── Reports ────────────────────────────────────────────────────
router.get('/reports', asyncHandler(getReports));

// ─── ZIP download ───────────────────────────────────────────────
router.get('/folders/:folderId/download-zip', asyncHandler(adminDownloadZip));

export default router;
