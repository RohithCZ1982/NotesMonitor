import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const studentRegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim(),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email address').toLowerCase(),
  address: z.string().max(500).trim().optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
});

export const studentLoginSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(1, 'Password is required'),
});

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Group name must be at least 2 characters')
    .max(100)
    .trim(),
  description: z.string().max(500).trim().optional(),
  students: z.array(z.string()).optional().default([]),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(200).trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  assignedGroups: z.array(z.string()).optional().default([]),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const assignFolderSchema = z.object({
  groupIds: z.array(z.string()).min(0),
});

export const updateStudentStatusSchema = z.object({
  status: z.enum(['active', 'rejected', 'pending']),
});

export const addStudentsToGroupSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'Select at least one student'),
});

export const trackDownloadSchema = z.object({
  fileId: z.string().optional(),
  type: z.enum(['file', 'folder']),
});
