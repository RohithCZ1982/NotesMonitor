import { useQuery } from '@tanstack/react-query';
import {
  Users,
  FolderOpen,
  UsersRound,
  Download,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  linkTo?: string;
}

function StatCard({ label, value, icon: Icon, color, linkTo }: StatCardProps) {
  const content = (
    <div className={`card p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: adminApi.getReports,
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader />;

  const ov = data?.overview;

  const greetHour = new Date().getHours();
  const greeting =
    greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={ov?.totalStudents ?? 0}
          icon={Users}
          color="bg-teal-500"
          linkTo="/admin/students"
        />
        <StatCard
          label="Active Students"
          value={ov?.activeStudents ?? 0}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          label="Pending Approval"
          value={ov?.pendingStudents ?? 0}
          icon={Clock}
          color="bg-amber-500"
          linkTo="/admin/students?status=pending"
        />
        <StatCard
          label="Total Folders"
          value={ov?.totalFolders ?? 0}
          icon={FolderOpen}
          color="bg-violet-500"
          linkTo="/admin/folders"
        />
        <StatCard
          label="Groups"
          value={ov?.totalGroups ?? 0}
          icon={UsersRound}
          color="bg-sky-500"
          linkTo="/admin/groups"
        />
        <StatCard
          label="Total Downloads"
          value={ov?.totalDownloads ?? 0}
          icon={Download}
          color="bg-rose-500"
          linkTo="/admin/reports"
        />
        <StatCard
          label="Rejected"
          value={ov?.rejectedStudents ?? 0}
          icon={UserX}
          color="bg-gray-500"
        />
        <StatCard
          label="Top Folders"
          value={data?.topFolders?.length ?? 0}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Recent activity + Top folders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent downloads */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Downloads</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentDownloads?.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No downloads yet
              </p>
            )}
            {data?.recentDownloads?.slice(0, 8).map((dl) => {
              const student =
                typeof dl.student === 'object' ? dl.student : null;
              const folder =
                typeof dl.folder === 'object' ? dl.folder : null;
              return (
                <div key={dl._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">
                    {(student?.name?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {student?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {folder && typeof folder === 'object' ? folder.name : '—'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {format(new Date(dl.downloadedAt), 'dd MMM')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top downloaded folders */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Most Downloaded Folders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.topFolders?.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No data yet
              </p>
            )}
            {data?.topFolders?.map((f, i) => (
              <div key={f._id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-sm font-bold text-gray-300 w-5 shrink-0">
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {f.folderName}
                  </p>
                  <p className="text-xs text-gray-400">{f.folderDate}</p>
                </div>
                <span className="text-sm font-semibold text-teal-600">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/folders"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <FolderOpen size={15} />
            Create Folder
          </Link>
          <Link
            to="/admin/students?status=pending"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Clock size={15} />
            Approve Students
          </Link>
          <Link
            to="/admin/groups"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <UsersRound size={15} />
            Manage Groups
          </Link>
        </div>
      </div>
    </div>
  );
}
