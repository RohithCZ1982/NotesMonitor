import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderOpen, BarChart3,
  UsersRound, LogOut, Menu, X, BookOpen, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/students',  icon: Users,           label: 'Students' },
  { to: '/admin/groups',    icon: UsersRound,      label: 'Groups' },
  { to: '/admin/folders',   icon: FolderOpen,      label: 'Folders' },
  { to: '/admin/reports',   icon: BarChart3,       label: 'Reports' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group',
      isActive
        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
        : 'text-teal-100/70 hover:bg-white/10 hover:text-white',
    ].join(' ');

  const Sidebar = (
    <aside className="flex flex-col h-full bg-teal-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
          <BookOpen size={17} />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">NotesMonitor</p>
          <p className="text-xs text-teal-300 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-teal-300/70 group-hover:text-white'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={13} className="ml-auto" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-teal-300/70 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-teal-200/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-teal-50/40">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col">{Sidebar}</div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">{Sidebar}</div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-teal-100 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-teal-50"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm text-teal-900">NotesMonitor</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
