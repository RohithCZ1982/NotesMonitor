/**
 * Removes all file records that were uploaded before Cloudinary migration.
 * These records have no `publicId` or `url` field and cannot be served.
 * Run once: npm run cleanup-uploads
 */
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { Folder } from '../models/Folder';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB\n');

  const folders = await Folder.find();
  let totalRemoved = 0;
  let foldersAffected = 0;

  for (const folder of folders) {
    const before = folder.files.length;

    // Keep only files that have a Cloudinary URL
    folder.files = folder.files.filter(
      (f) => !!(f as any).url && !!(f as any).publicId
    ) as typeof folder.files;

    const removed = before - folder.files.length;

    if (removed > 0) {
      await folder.save();
      console.log(`  Folder "${folder.name}": removed ${removed} old file record(s)`);
      totalRemoved += removed;
      foldersAffected++;
    }
  }

  console.log(`\nDone. Removed ${totalRemoved} old file record(s) across ${foldersAffected} folder(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
