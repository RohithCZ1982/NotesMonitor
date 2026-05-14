import { useQuery } from '@tanstack/react-query';
import {
  Users, FolderOpen, Download, UsersRound, UserCheck, Clock, UserX, TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../../api/admin';
import { PageLoader } from '../../components/ui/LoadingSpinner';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: adminApi.getReports,
    refetchInterval: 30_000,
  });

  if (isLoading) return <PageLoader />;

  const ov = data?.overview;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide statistics</p>
      </div>

      {/* Overview stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={ov?.totalStudents ?? 0} icon={Users} color="bg-indigo-500" />
          <StatCard label="Active" value={ov?.activeStudents ?? 0} icon={UserCheck} color="bg-emerald-500" />
          <StatCard label="Pending" value={ov?.pendingStudents ?? 0} icon={Clock} color="bg-amber-500" />
          <StatCard label="Rejected" value={ov?.rejectedStudents ?? 0} icon={UserX} color="bg-red-400" />
          <StatCard label="Total Folders" value={ov?.totalFolders ?? 0} icon={FolderOpen} color="bg-violet-500" />
          <StatCard label="Groups" value={ov?.totalGroups ?? 0} icon={UsersRound} color="bg-sky-500" />
          <StatCard label="Total Downloads" value={ov?.totalDownloads ?? 0} icon={Download} color="bg-rose-500" />
          <StatCard label="Top Folders" value={data?.topFolders?.length ?? 0} icon={TrendingUp} color="bg-orange-500" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top downloaded folders */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Most Downloaded Folders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.topFolders?.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No downloads yet</p>
            )}
            {data?.topFolders?.map((f, i) => (
              <div key={f._id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{f.folderName}</p>
                  <p className="text-xs text-gray-400">{f.folderDate}</p>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-semibold text-sm">
                  <Download size={13} />
                  {f.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Groups student count */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Students per Group</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.groupStats?.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No groups yet</p>
            )}
            {data?.groupStats?.map((g) => {
              const max = Math.max(...(data.groupStats?.map((x) => x.studentCount) ?? [1]));
              const pct = max > 0 ? (g.studentCount / max) * 100 : 0;
              return (
                <div key={g._id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-700">{g.name}</p>
                    <span className="text-sm text-gray-500">{g.studentCount}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent downloads */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Download Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-500">Student</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500">Folder</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.recentDownloads?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No downloads yet
                  </td>
                </tr>
              )}
              {data?.recentDownloads?.map((dl) => {
                const student = typeof dl.student === 'object' ? dl.student : null;
                const folder = typeof dl.folder === 'object' ? dl.folder : null;
                return (
                  <tr key={dl._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {(student?.name?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{student?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{student?.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {folder && typeof folder === 'object' ? folder.name : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          dl.type === 'folder'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {dl.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {format(new Date(dl.downloadedAt), 'dd MMM yyyy, HH:mm')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
