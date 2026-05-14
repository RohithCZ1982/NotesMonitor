import { Response } from 'express';
import axios from 'axios';
import archiver from 'archiver';
import { Folder } from '../models/Folder';
import { User } from '../models/User';
import { Download } from '../models/Download';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export async function getStudentFolders(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId);
  if (!user) { sendError(res, 'User not found', 404); return; }

  if (user.status !== 'active') {
    sendSuccess(res, {
      folders: [],
      status: user.status,
      message: user.status === 'pending'
        ? 'Your account is pending admin approval.'
        : 'Your account has been rejected.',
    });
    return;
  }

  const folders = await Folder.find({
    assignedGroups: { $in: user.assignedGroups },
  })
    .populate('assignedGroups', 'name')
    .sort({ date: -1, createdAt: -1 });

  sendSuccess(res, { folders, status: user.status });
}

export async function getFolderById(req: AuthRequest, res: Response): Promise<void> {
  const { folderId } = req.params;

  const user = await User.findById(req.user!.userId);
  if (!user) { sendError(res, 'User not found', 404); return; }
  if (user.status !== 'active') { sendError(res, 'Account not active', 403); return; }

  const folder = await Folder.findOne({
    _id: folderId,
    assignedGroups: { $in: user.assignedGroups },
  }).populate('assignedGroups', 'name');

  if (!folder) { sendError(res, 'Folder not found or not accessible', 404); return; }
  sendSuccess(res, { folder });
}

export async function trackDownload(req: AuthRequest, res: Response): Promise<void> {
  const { folderId } = req.params;
  const { fileId, type } = req.body;

  await Download.create({
    student: req.user!.userId,
    folder: folderId,
    fileId: fileId || undefined,
    type: type || 'file',
  });

  sendSuccess(res, null, 'Download tracked');
}

export async function studentDownloadZip(req: AuthRequest, res: Response): Promise<void> {
  const { folderId } = req.params;

  const user = await User.findById(req.user!.userId);
  if (!user || user.status !== 'active') { sendError(res, 'Access denied', 403); return; }

  const folder = await Folder.findOne({
    _id: folderId,
    assignedGroups: { $in: user.assignedGroups },
  });

  if (!folder) { sendError(res, 'Folder not found or not accessible', 404); return; }

  await Download.create({ student: req.user!.userId, folder: folderId, type: 'folder' });

  const safeName = folder.name.replace(/[^a-z0-9\-_\s]/gi, '_');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  for (const file of folder.files) {
    try {
      const response = await axios.get<import("stream").Readable>(file.url, { responseType: 'stream' });
      archive.append(response.data, { name: file.originalName });
    } catch {
      // Skip files that fail
    }
  }

  await archive.finalize();
}

export async function getStudentProfile(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId).populate('assignedGroups', 'name description');
  if (!user) { sendError(res, 'User not found', 404); return; }
  sendSuccess(res, { user });
}
