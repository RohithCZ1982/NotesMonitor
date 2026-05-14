import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

import AdminLogin from './pages/auth/AdminLogin';
import StudentAuth from './pages/auth/StudentAuth';

import AdminDashboard from './pages/admin/Dashboard';
import StudentsPage from './pages/admin/Students';
import GroupsPage from './pages/admin/Groups';
import FoldersPage from './pages/admin/Folders';
import ReportsPage from './pages/admin/Reports';

import StudentDashboard from './pages/student/Dashboard';
import FolderView from './pages/student/FolderView';
import StudentProfile from './pages/student/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<StudentAuth />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/groups" element={<GroupsPage />} />
              <Route path="/admin/folders" element={<FoldersPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/folder/:folderId" element={<FolderView />} />
              <Route path="/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
