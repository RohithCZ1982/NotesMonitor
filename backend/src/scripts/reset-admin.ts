import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { User } from '../models/User';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function resetAdmin() {
  const uri = process.env.MONGODB_URI!;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await User.deleteMany({ role: 'admin' });
  console.log('Deleted existing admin(s)');

  const email = process.env.ADMIN_EMAIL || 'admin@notesmonitor.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const mobile = process.env.ADMIN_MOBILE || '9000000000';

  await User.create({
    name: 'System Admin',
    mobile,
    email,
    password,
    role: 'admin',
    status: 'active',
  });

  console.log(`Admin created — email: ${email}  password: ${password}`);
  await mongoose.disconnect();
  process.exit(0);
}

resetAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
