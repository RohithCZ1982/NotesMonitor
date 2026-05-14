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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NotesMonitor</h1>
            <p className="text-indigo-200 text-sm mt-1">Admin Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Sign in</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Access the admin dashboard
              </p>
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

            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="pointer-events-auto"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            >
              Sign in to Dashboard
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Student?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Go to student login
          </a>
        </p>
      </div>
    </div>
  );
}
