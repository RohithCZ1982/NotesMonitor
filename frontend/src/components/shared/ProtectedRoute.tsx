import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/LoadingSpinner';
import { UserRole } from '../../types';

interface Props {
  role?: UserRole;
}

export default function ProtectedRoute({ role }: Props) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    const loginPath = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    const redirect = user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
