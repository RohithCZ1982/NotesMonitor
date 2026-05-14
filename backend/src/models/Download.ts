import mongoose, { Document, Schema } from 'mongoose';

export interface IDownload extends Document {
  student: mongoose.Types.ObjectId;
  folder: mongoose.Types.ObjectId;
  fileId?: mongoose.Types.ObjectId;
  type: 'file' | 'folder';
  downloadedAt: Date;
}

const downloadSchema = new Schema<IDownload>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  folder: { type: Schema.Types.ObjectId, ref: 'Folder', required: true },
  fileId: { type: Schema.Types.ObjectId },
  type: { type: String, enum: ['file', 'folder'], required: true },
  downloadedAt: { type: Date, default: Date.now },
});

downloadSchema.index({ student: 1, folder: 1 });
downloadSchema.index({ folder: 1 });
downloadSchema.index({ downloadedAt: -1 });

export const Download = mongoose.model<IDownload>('Download', downloadSchema);
