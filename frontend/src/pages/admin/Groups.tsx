import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserMinus,
  UserPlus,
  Search,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Group, User } from '../../types';

export default function GroupsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [manageGroup, setManageGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const qc = useQueryClient();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', description: '' });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: adminApi.getGroups,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['admin-students', '', 'active', 1],
    queryFn: () => adminApi.getStudents({ status: 'active', limit: 200 }),
  });
  const allStudents = studentsData?.students ?? [];

  const createMut = useMutation({
    mutationFn: adminApi.createGroup,
    onSuccess: () => {
      toast.success('Group created');
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
      setCreateOpen(false);
      setForm({ name: '', description: '' });
    },
    onError: (e) => toast.apiError(e),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      adminApi.updateGroup(id, data),
    onSuccess: () => {
      toast.success('Group updated');
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
      setEditGroup(null);
    },
    onError: (e) => toast.apiError(e),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteGroup(id),
    onSuccess: () => {
      toast.success('Group deleted');
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
      setDeleteGroup(null);
    },
    onError: (e) => toast.apiError(e),
  });

  const addStudentMut = useMutation({
    mutationFn: ({ groupId, studentIds }: { groupId: string; studentIds: string[] }) =>
      adminApi.addStudentsToGroup(groupId, studentIds),
    onSuccess: (updatedGroup) => {
      qc.setQueryData(['admin-groups'], (old: Group[]) =>
        old.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
      setManageGroup(updatedGroup);
      toast.success('Student added to group');
    },
    onError: (e) => toast.apiError(e),
  });

  const removeStudentMut = useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
      adminApi.removeStudentFromGroup(groupId, studentId),
    onSuccess: (updatedGroup) => {
      qc.setQueryData(['admin-groups'], (old: Group[]) =>
        old.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
      setManageGroup(updatedGroup);
      toast.success('Student removed');
    },
    onError: (e) => toast.apiError(e),
  });

  const groupStudentIds = new Set(
    (manageGroup?.students ?? []).map((s) => (typeof s === 'object' ? s._id : s))
  );

  const availableStudents = allStudents.filter(
    (s) =>
      !groupStudentIds.has(s._id) &&
      (!studentSearch ||
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.mobile.includes(studentSearch))
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
          <p className="text-sm text-gray-500 mt-1">{groups.length} groups</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Group
        </Button>
      </div>

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No groups yet. Create your first group.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  {group.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditGroup(group);
                      setForm({ name: group.name, description: group.description ?? '' });
                    }}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteGroup(group)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Users size={14} />
                {group.students.length} student{group.students.length !== 1 ? 's' : ''}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {group.students.slice(0, 4).map((s) =>
                  typeof s === 'object' ? (
                    <div
                      key={s._id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 rounded-full"
                    >
                      <div className="w-4 h-4 rounded-full bg-teal-200 flex items-center justify-center text-[10px] font-bold text-teal-700">
                        {s.name[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-teal-700 max-w-[70px] truncate">
                        {s.name}
                      </span>
                    </div>
                  ) : null
                )}
                {group.students.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                    +{group.students.length - 4} more
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<UserPlus size={14} />}
                onClick={() => {
                  setManageGroup(group);
                  setStudentSearch('');
                }}
              >
                Manage Students
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setForm({ name: '', description: '' }); }}
        title="Create Group"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate(form);
          }}
          className="px-6 py-4 space-y-4"
        >
          <Input
            label="Group Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. NEET Batch 2026"
            required
          />
          <Textarea
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description…"
          />
          <Button type="submit" fullWidth loading={createMut.isPending}>
            Create Group
          </Button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editGroup}
        onClose={() => setEditGroup(null)}
        title="Edit Group"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editGroup)
              updateMut.mutate({ id: editGroup._id, data: form });
          }}
          className="px-6 py-4 space-y-4"
        >
          <Input
            label="Group Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button type="submit" fullWidth loading={updateMut.isPending}>
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Manage students modal */}
      <Modal
        open={!!manageGroup}
        onClose={() => setManageGroup(null)}
        title={`Manage — ${manageGroup?.name}`}
        size="lg"
      >
        <div className="px-6 py-4 space-y-5">
          {/* Current members */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Current Members ({manageGroup?.students.length ?? 0})
            </p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {manageGroup?.students.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No students yet</p>
              )}
              {manageGroup?.students.map((s) =>
                typeof s === 'object' ? (
                  <div
                    key={s._id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                        {s.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={s.status} />
                      <button
                        onClick={() =>
                          removeStudentMut.mutate({
                            groupId: manageGroup._id,
                            studentId: s._id,
                          })
                        }
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Add students */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Add Active Students
            </p>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="input-base pl-8 text-sm"
              />
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {availableStudents.length === 0 && (
                <p className="text-sm text-gray-400 py-2">
                  {studentSearch ? 'No matching students' : 'All active students are in this group'}
                </p>
              )}
              {availableStudents.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.mobile}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      addStudentMut.mutate({
                        groupId: manageGroup!._id,
                        studentIds: [s._id],
                      })
                    }
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Add to group"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteGroup}
        onClose={() => setDeleteGroup(null)}
        onConfirm={() => deleteGroup && deleteMut.mutate(deleteGroup._id)}
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteGroup?.name}"? Students will be unassigned from this group.`}
        confirmLabel="Delete Group"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
