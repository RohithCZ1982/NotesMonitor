import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Folder } from '../models/Folder';
import { Download } from '../models/Download';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export async function getStudents(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { search, status, page = '1', limit = '20' } = req.query;
  const query: Record<string, unknown> = { role: 'student' };

  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { mobile: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page)));
  const limitNum = Math.min(100, parseInt(String(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [students, total] = await Promise.all([
    User.find(query)
      .populate('assignedGroups', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  sendSuccess(res, { students, total, page: pageNum, limit: limitNum });
}

export async function updateStudentStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id, role: 'student' },
    { status },
    { new: true }
  ).populate('assignedGroups', 'name');

  if (!user) {
    sendError(res, 'Student not found', 404);
    return;
  }

  sendSuccess(res, { user }, `Student ${status} successfully`);
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────

export async function getGroups(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const groups = await Group.find()
    .populate('students', 'name mobile email status')
    .sort({ createdAt: -1 });

  sendSuccess(res, { groups });
}

export async function createGroup(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { name, description, students } = req.body;

  const group = await Group.create({
    name,
    description,
    students: students ?? [],
    createdBy: req.user!.userId,
  });

  if (students?.length) {
    await User.updateMany(
      { _id: { $in: students } },
      { $addToSet: { assignedGroups: group._id } }
    );
  }

  const populated = await Group.findById(group._id).populate(
    'students',
    'name mobile email status'
  );

  sendSuccess(res, { group: populated }, 'Group created successfully', 201);
}

export async function updateGroup(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { name, description } = req.body;

  const group = await Group.findByIdAndUpdate(
    id,
    { ...(name && { name }), ...(description !== undefined && { description }) },
    { new: true }
  ).populate('students', 'name mobile email status');

  if (!group) {
    sendError(res, 'Group not found', 404);
    return;
  }

  sendSuccess(res, { group });
}

export async function deleteGroup(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const group = await Group.findById(id);
  if (!group) {
    sendError(res, 'Group not found', 404);
    return;
  }

  await User.updateMany(
    { assignedGroups: id },
    { $pull: { assignedGroups: id } }
  );

  await Group.findByIdAndDelete(id);
  sendSuccess(res, null, 'Group deleted');
}

export async function addStudentsToGroup(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { studentIds } = req.body;

  const group = await Group.findById(id);
  if (!group) {
    sendError(res, 'Group not found', 404);
    return;
  }

  await Group.findByIdAndUpdate(id, {
    $addToSet: { students: { $each: studentIds } },
  });

  await User.updateMany(
    { _id: { $in: studentIds } },
    { $addToSet: { assignedGroups: id } }
  );

  const updated = await Group.findById(id).populate(
    'students',
    'name mobile email status'
  );

  sendSuccess(res, { group: updated });
}

export async function removeStudentFromGroup(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id, studentId } = req.params;

  await Promise.all([
    Group.findByIdAndUpdate(id, { $pull: { students: studentId } }),
    User.findByIdAndUpdate(studentId, { $pull: { assignedGroups: id } }),
  ]);

  const updated = await Group.findById(id).populate(
    'students',
    'name mobile email status'
  );

  sendSuccess(res, { group: updated });
}

// ─── FOLDERS ─────────────────────────────────────────────────────────────────

export async function getFolders(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { page = '1', limit = '20', search } = req.query;
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { date: { $regex: String(search), $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(String(page)));
  const limitNum = Math.min(100, parseInt(String(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [folders, total] = await Promise.all([
    Folder.find(query)
      .populate('assignedGroups', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Folder.countDocuments(query),
  ]);

  sendSuccess(res, { folders, total, page: pageNum, limit: limitNum });
}

export async function createFolder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { name, date, assignedGroups } = req.body;

  const folder = await Folder.create({
    name,
    date,
    assignedGroups: assignedGroups ?? [],
    createdBy: req.user!.userId,
  });

  sendSuccess(res, { folder }, 'Folder created successfully', 201);
}

export async function updateFolder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { name, date } = req.body;

  const folder = await Folder.findByIdAndUpdate(
    id,
    { ...(name && { name }), ...(date && { date }) },
    { new: true }
  ).populate('assignedGroups', 'name');

  if (!folder) {
    sendError(res, 'Folder not found', 404);
    return;
  }

  sendSuccess(res, { folder });
}

export async function deleteFolder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const folder = await Folder.findById(id);
  if (!folder) {
    sendError(res, 'Folder not found', 404);
    return;
  }

  const uploadDir = path.join(__dirname, '../../uploads', id);
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }

  await Folder.findByIdAndDelete(id);
  sendSuccess(res, null, 'Folder deleted');
}

export async function uploadFilesToFolder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { folderId } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    sendError(res, 'No files provided', 400);
    return;
  }

  const folder = await Folder.findById(folderId);
  if (!folder) {
    files.forEach((f) => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    sendError(res, 'Folder not found', 404);
    return;
  }

  const newFiles = files.map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    mimetype: f.mimetype,
    size: f.size,
    path: f.path,
    uploadDate: new Date(),
  }));

  folder.files.push(...(newFiles as typeof folder.files));
  await folder.save();

  sendSuccess(
    res,
    { addedFiles: newFiles, totalFiles: folder.files.length },
    `${files.length} file(s) uploaded successfully`
  );
}

export async function deleteFileFromFolder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { folderId, fileId } = req.params;

  const folder = await Folder.findById(folderId);
  if (!folder) {
    sendError(res, 'Folder not found', 404);
    return;
  }

  const file = folder.files.find((f) => f._id.toString() === fileId);
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  folder.files = folder.files.filter(
    (f) => f._id.toString() !== fileId
  ) as typeof folder.files;

  await folder.save();
  sendSuccess(res, null, 'File deleted');
}

export async function assignFolderToGroups(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { folderId } = req.params;
  const { groupIds } = req.body;

  const folder = await Folder.findByIdAndUpdate(
    folderId,
    { assignedGroups: groupIds },
    { new: true }
  ).populate('assignedGroups', 'name');

  if (!folder) {
    sendError(res, 'Folder not found', 404);
    return;
  }

  sendSuccess(res, { folder }, 'Folder assigned to groups');
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export async function getReports(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const [
    totalStudents,
    activeStudents,
    pendingStudents,
    rejectedStudents,
    totalFolders,
    totalGroups,
    totalDownloads,
    recentDownloads,
    groupStats,
    topFolders,
    recentFolders,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', status: 'active' }),
    User.countDocuments({ role: 'student', status: 'pending' }),
    User.countDocuments({ role: 'student', status: 'rejected' }),
    Folder.countDocuments(),
    Group.countDocuments(),
    Download.countDocuments(),
    Download.find()
      .populate('student', 'name mobile')
      .populate('folder', 'name date')
      .sort({ downloadedAt: -1 })
      .limit(15),
    Group.aggregate([
      {
        $project: {
          name: 1,
          studentCount: { $size: '$students' },
        },
      },
      { $sort: { studentCount: -1 } },
    ]),
    Download.aggregate([
      { $group: { _id: '$folder', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'folders',
          localField: '_id',
          foreignField: '_id',
          as: 'folder',
        },
      },
      { $unwind: '$folder' },
      {
        $project: {
          folderName: '$folder.name',
          folderDate: '$folder.date',
          count: 1,
        },
      },
    ]),
    Folder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name date createdAt'),
  ]);

  sendSuccess(res, {
    overview: {
      totalStudents,
      activeStudents,
      pendingStudents,
      rejectedStudents,
      totalFolders,
      totalGroups,
      totalDownloads,
    },
    groupStats,
    topFolders,
    recentDownloads,
    recentFolders,
  });
}

// ─── FILE ACCESS (ADMIN) ──────────────────────────────────────────────────────

export async function adminServeFile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { folderId, filename } = req.params;
  const filePath = path.resolve(__dirname, '../../uploads', folderId, filename);

  const uploadsRoot = path.resolve(__dirname, '../../uploads');
  if (!filePath.startsWith(uploadsRoot)) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  if (!fs.existsSync(filePath)) {
    sendError(res, 'File not found', 404);
    return;
  }

  res.sendFile(filePath);
}

export async function adminDownloadZip(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { folderId } = req.params;

  const folder = await Folder.findById(folderId);
  if (!folder) {
    sendError(res, 'Folder not found', 404);
    return;
  }

  const safeName = folder.name.replace(/[^a-z0-9\-_\s]/gi, '_');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}.zip"`
  );

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err) => {
    throw err;
  });
  archive.pipe(res);

  const folderDir = path.join(__dirname, '../../uploads', folderId);
  for (const file of folder.files) {
    const fp = path.join(folderDir, file.filename);
    if (fs.existsSync(fp)) {
      archive.file(fp, { name: file.originalName });
    }
  }

  await archive.finalize();
}
