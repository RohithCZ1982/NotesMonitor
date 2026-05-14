import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.adminLogin(form.email, form.password);
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.apiError(err, 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-100 overflow-hidden border border-teal-100">
          {/* Header */}
          <div className="bg-teal-600 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NotesMonitor</h1>
            <p className="text-teal-100 text-sm mt-1">Admin Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Sign in</h2>
              <p className="text-sm text-gray-500 mt-0.5">Access the admin dashboard</p>
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="pointer-events-auto">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Sign in to Dashboard
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Student?{' '}
          <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Go to student login
          </a>
        </p>
      </div>
    </div>
  );
}
