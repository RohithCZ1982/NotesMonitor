import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  address?: string;
  password: string;
  role: 'admin' | 'student';
  status: 'pending' | 'active' | 'rejected';
  assignedGroups: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: { type: String, trim: true, maxlength: 500 },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending',
    },
    assignedGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  },
  { timestamps: true }
);

// mobile and email already indexed via unique:true — only add the compound index
userSchema.index({ role: 1, status: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r['password'];
    return r;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
