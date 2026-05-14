import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from './logger';

// Force Google DNS so SRV record lookups work regardless of local resolver
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-monitor';

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
