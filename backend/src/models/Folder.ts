import mongoose, { Document, Schema } from 'mongoose';

export interface IFile {
  _id: mongoose.Types.ObjectId;
  originalName: string;
  publicId: string;   // Cloudinary public_id (used for deletion)
  url: string;        // Cloudinary secure CDN URL
  mimetype: string;
  size: number;
  uploadDate: Date;
}

export interface IFolder extends Document {
  name: string;
  date: string; // YYYY-MM-DD
  files: IFile[];
  assignedGroups: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    originalName: { type: String, required: true },
    publicId:     { type: String, required: true },
    url:          { type: String, required: true },
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true },
    uploadDate:   { type: Date, default: Date.now },
  },
  { _id: true }
);

const folderSchema = new Schema<IFolder>(
  {
    name:           { type: String, required: true, trim: true, maxlength: 200 },
    date:           { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    files:          [fileSchema],
    assignedGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

folderSchema.index({ date: -1 });
folderSchema.index({ assignedGroups: 1 });

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
