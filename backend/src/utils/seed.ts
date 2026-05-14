import { User } from '../models/User';
import { logger } from '../config/logger';

export async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@notesmonitor.com';
  const adminMobile = process.env.ADMIN_MOBILE || '9000000000';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    logger.info(`Admin already exists: ${existing.email}`);
    return;
  }

  await User.create({
    name: 'System Admin',
    mobile: adminMobile,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    status: 'active',
  });

  logger.info(`Default admin created — email: ${adminEmail} | password: ${adminPassword}`);
  logger.warn('Change the default admin password immediately in production!');
}
