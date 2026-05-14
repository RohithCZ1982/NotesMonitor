import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
]);

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const folderId = req.params.folderId;
    if (!folderId) {
      cb(new Error('Folder ID is required'), '');
      return;
    }
    const dest = path.join(UPLOAD_ROOT, folderId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIMETYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. Accepted: JPG, PNG, WEBP, MP4, MOV`
      )
    );
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB per file
    files: 20,
  },
});
