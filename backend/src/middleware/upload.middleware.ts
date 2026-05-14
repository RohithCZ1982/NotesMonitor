import multer, { StorageEngine } from 'multer';
import { Request } from 'express';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';

const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
]);

class CloudinaryStorage implements StorageEngine {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error?: Error | null, info?: Partial<Express.Multer.File>) => void
  ) {
    const folderId = req.params.folderId || 'general';
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `notes-monitor/${folderId}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          cb(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        cb(null, {
          filename: result.public_id,   // used as publicId
          path: result.secure_url,      // CDN URL
          size: result.bytes,
        } as Partial<Express.Multer.File>);
      }
    );

    (file as any).stream.pipe(uploadStream);
  }

  _removeFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null) => void
  ) {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    cloudinary.uploader
      .destroy(file.filename, { resource_type: resourceType })
      .then(() => cb(null))
      .catch((err: Error) => cb(err));
  }
}

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIMETYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed. Accepted: JPG, PNG, WEBP, MP4, MOV`));
  }
}

export const upload = multer({
  storage: new CloudinaryStorage(),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
    files: 20,
  },
});
