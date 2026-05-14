import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, MapPin, Shield, UsersRound } from 'lucide-react';
import { format } from 'date-fns';
import { studentApi } from '../../api/student';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

export default function StudentProfile() {
  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentApi.getProfile,
  });

  if (isLoading) return <PageLoader />;
  if (!student) return null;

  const groups = Array.isArray(student.assignedGroups)
    ? student.assignedGroups.filter((g) => typeof g === 'object')
    : [];

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {student.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={student.status} />
              <Badge status="student" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Phone size={15} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Mobile Number</p>
              <p className="font-medium text-gray-800">{student.mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Mail size={15} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="font-medium text-gray-800">{student.email}</p>
            </div>
          </div>

          {student.address && (
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-medium text-gray-800">{student.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Shield size={15} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Account Status</p>
              <div className="mt-0.5">
                <Badge status={student.status} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <User size={15} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Member Since</p>
              <p className="font-medium text-gray-800">
                {format(new Date(student.createdAt), 'dd MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UsersRound size={18} className="text-teal-600" />
          <h2 className="font-semibold text-gray-800">My Groups</h2>
          <span className="ml-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
            {groups.length}
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-6">
            <UsersRound size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">
              You haven't been assigned to any group yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) =>
              typeof g === 'object' ? (
                <div
                  key={g._id}
                  className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                    <UsersRound size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-teal-900">{g.name}</p>
                    {g.description && (
                      <p className="text-xs text-teal-600">{g.description}</p>
                    )}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {student.status === 'pending' && (
        <div className="card p-4 bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Awaiting approval:</strong> Your account is pending admin approval. You'll receive access to notes once approved.
          </p>
        </div>
      )}
    </div>
  );
}
