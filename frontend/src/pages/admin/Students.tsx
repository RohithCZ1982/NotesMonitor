import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { User } from '../../types';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'rejected', label: 'Rejected' },
];

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const limit = 15;
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, statusFilter, page],
    queryFn: () =>
      adminApi.getStudents({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
  });

  const approveMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'rejected' }) =>
      adminApi.updateStudentStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'active' ? 'Student approved' : 'Student rejected');
      qc.invalidateQueries({ queryKey: ['admin-students'] });
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelected(null);
    },
    onError: (err) => toast.apiError(err),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data?.total ?? 0} total registered students
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, mobile or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                statusFilter === key
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Student</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Mobile</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Groups</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden sm:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No students found
                    </td>
                  </tr>
                )}
                {data?.students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">
                          {student.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-medium text-gray-800 cursor-pointer hover:text-teal-600"
                            onClick={() => setSelected(student)}
                          >
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                      {student.mobile}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(student.assignedGroups) &&
                          student.assignedGroups.slice(0, 2).map((g) =>
                            typeof g === 'object' ? (
                              <span
                                key={g._id}
                                className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs"
                              >
                                {g.name}
                              </span>
                            ) : null
                          )}
                        {Array.isArray(student.assignedGroups) &&
                          student.assignedGroups.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                              +{student.assignedGroups.length - 2}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={student.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">
                      {format(new Date(student.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {student.status !== 'active' && (
                          <button
                            onClick={() =>
                              approveMut.mutate({ id: student._id, status: 'active' })
                            }
                            title="Approve"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        {student.status !== 'rejected' && (
                          <button
                            onClick={() =>
                              approveMut.mutate({ id: student._id, status: 'rejected' })
                            }
                            title="Reject"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, data?.total ?? 0)} of {data?.total}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Student Details"
        size="sm"
      >
        {selected && (
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-xl font-bold text-teal-700">
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">{selected.name}</p>
                <Badge status={selected.status} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {selected.mobile}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />
                {selected.email}
              </div>
              {selected.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {selected.address}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Groups
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(selected.assignedGroups) &&
                selected.assignedGroups.length > 0 ? (
                  selected.assignedGroups.map((g) =>
                    typeof g === 'object' ? (
                      <span
                        key={g._id}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                      >
                        {g.name}
                      </span>
                    ) : null
                  )
                ) : (
                  <p className="text-xs text-gray-400">Not assigned to any group</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Registered {format(new Date(selected.createdAt), 'dd MMM yyyy, HH:mm')}
            </p>

            <div className="flex gap-3 pt-2">
              {selected.status !== 'active' && (
                <Button
                  variant="success"
                  fullWidth
                  loading={approveMut.isPending}
                  onClick={() =>
                    approveMut.mutate({ id: selected._id, status: 'active' })
                  }
                >
                  Approve
                </Button>
              )}
              {selected.status !== 'rejected' && (
                <Button
                  variant="danger"
                  fullWidth
                  loading={approveMut.isPending}
                  onClick={() =>
                    approveMut.mutate({ id: selected._id, status: 'rejected' })
                  }
                >
                  Reject
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
