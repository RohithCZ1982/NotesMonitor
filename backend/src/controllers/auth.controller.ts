import { Request, Response } from 'express';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: 'admin' });
  if (!user || !(await user.comparePassword(password))) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  sendSuccess(res, { token, user }, 'Login successful');
}

export async function studentRegister(
  req: Request,
  res: Response
): Promise<void> {
  const { name, mobile, email, address, password } = req.body;

  const existing = await User.findOne({ $or: [{ mobile }, { email }] });
  if (existing) {
    const field = existing.mobile === mobile ? 'Mobile number' : 'Email';
    sendError(res, `${field} is already registered`, 409);
    return;
  }

  const user = await User.create({
    name,
    mobile,
    email,
    address,
    password,
    role: 'student',
    status: 'pending',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  sendSuccess(
    res,
    { token, user },
    'Registration successful. Please wait for admin approval.',
    201
  );
}

export async function studentLogin(
  req: Request,
  res: Response
): Promise<void> {
  const { mobile, password } = req.body;

  const user = await User.findOne({ mobile, role: 'student' }).populate(
    'assignedGroups',
    'name'
  );

  if (!user || !(await user.comparePassword(password))) {
    sendError(res, 'Invalid mobile number or password', 401);
    return;
  }

  if (user.status === 'rejected') {
    sendError(
      res,
      'Your account has been rejected. Contact admin.',
      403
    );
    return;
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  sendSuccess(res, { token, user }, 'Login successful');
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user?.userId).populate(
    'assignedGroups',
    'name description'
  );

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, { user });
}
