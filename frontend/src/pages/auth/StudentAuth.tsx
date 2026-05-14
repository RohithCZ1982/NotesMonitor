import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Phone, Lock, User, Mail, MapPin, Eye, EyeOff, Clock, CheckCircle } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

type Tab = 'login' | 'register';

export default function StudentAuth() {
  const [tab, setTab] = useState<Tab>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ name: string; mobile: string } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loginForm, setLoginForm] = useState({ mobile: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '', mobile: '', email: '', address: '', password: '', confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.studentLogin(loginForm.mobile, loginForm.password);
      login(token, user);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.apiError(err, 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.studentRegister({
        name: regForm.name, mobile: regForm.mobile, email: regForm.email,
        address: regForm.address || undefined, password: regForm.password,
      });
      // Do NOT log in — show pending approval message instead
      setRegistered({ name: regForm.name, mobile: regForm.mobile });
    } catch (err) {
      toast.apiError(err, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Registration success screen ─────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-teal-100 border border-teal-100 overflow-hidden">
            {/* Top bar */}
            <div className="bg-teal-600 h-2" />

            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Clock size={30} className="text-amber-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Hi <span className="font-semibold text-gray-700">{registered.name}</span>, your account has been created.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-left mb-6">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Awaiting Admin Approval</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Your account is pending approval. Once the admin approves your registration,
                      you can log in using your mobile number and password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-teal-500 shrink-0" />
                  <span>Account created with mobile: <strong className="text-gray-700">{registered.mobile}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-teal-500 shrink-0" />
                  <span>You will be notified once approved</span>
                </div>
              </div>

              <button
                onClick={() => { setRegistered(null); setTab('login'); }}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Admin?{' '}
            <Link to="/admin/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Admin login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── Login / Register form ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-200">
            <BookOpen size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-teal-900">NotesMonitor</h1>
          <p className="text-gray-500 text-sm mt-1">Student Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-100 overflow-hidden border border-teal-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 text-sm font-medium transition-colors',
                  tab === t
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="px-6 py-6">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Mobile Number" type="tel" placeholder="9876543210"
                  value={loginForm.mobile}
                  onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
                  leftIcon={<Phone size={16} />} maxLength={10} required autoComplete="tel"
                />
                <Input
                  label="Password" type={showPw ? 'text' : 'password'} placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="pointer-events-auto">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required autoComplete="current-password"
                />
                <Button type="submit" loading={loading} fullWidth size="lg">Sign In</Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Full Name" type="text" placeholder="Rahul Sharma"
                  value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  leftIcon={<User size={16} />} required autoComplete="name" />
                <Input label="Mobile Number" type="tel" placeholder="9876543210"
                  value={regForm.mobile} onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                  leftIcon={<Phone size={16} />} maxLength={10} required
                  hint="10-digit Indian mobile number" autoComplete="tel" />
                <Input label="Email Address" type="email" placeholder="you@example.com"
                  value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  leftIcon={<Mail size={16} />} required autoComplete="email" />
                <Input label="Address (optional)" type="text" placeholder="City, State"
                  value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  leftIcon={<MapPin size={16} />} />
                <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  leftIcon={<Lock size={16} />} required minLength={6} autoComplete="new-password" />
                <Input label="Confirm Password" type={showPw ? 'text' : 'password'} placeholder="Re-enter password"
                  value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  leftIcon={<Lock size={16} />} required
                  rightIcon={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="pointer-events-auto">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  } autoComplete="new-password" />
                <Button type="submit" loading={loading} fullWidth size="lg">Create Account</Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Admin?{' '}
          <Link to="/admin/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
