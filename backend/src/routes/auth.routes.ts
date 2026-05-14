import { Router } from 'express';
import {
  adminLogin,
  studentRegister,
  studentLogin,
  getMe,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  adminLoginSchema,
  studentRegisterSchema,
  studentLoginSchema,
} from '../schemas/validation.schemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/admin/login', validate(adminLoginSchema), asyncHandler(adminLogin));
router.post('/student/register', validate(studentRegisterSchema), asyncHandler(studentRegister));
router.post('/student/login', validate(studentLoginSchema), asyncHandler(studentLogin));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;
