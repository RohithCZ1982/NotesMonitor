import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Search, Clock, Image, Video, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { studentApi } from '../../api/student';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { Folder } from '../../types';

function FolderCard({ folder, onClick }: { folder: Folder; onClick: () => void }) {
  const imageCount = folder.files.filter((f) => f.mimetype.startsWith('image/')).length;
  const videoCount = folder.files.filter((f) => f.mimetype.startsWith('video/')).length;

  const groups = Array.isArray(folder.assignedGroups)
    ? folder.assignedGroups.filter((g) => typeof g === 'object')
    : [];

  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <FolderOpen size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 line-clamp-2 text-sm leading-snug">
            {folder.name}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Clock size={11} />
            <span>{folder.date}</span>
          </div>
        </div>
      </div>

      {/* File counts */}
      <div className="flex items-center gap-3 mb-3">
        {imageCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Image size={12} className="text-indigo-400" />
            {imageCount} image{imageCount !== 1 ? 's' : ''}
          </div>
        )}
        {videoCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Video size={12} className="text-violet-400" />
            {videoCount} video{videoCount !== 1 ? 's' : ''}
          </div>
        )}
        {folder.files.length === 0 && (
          <span className="text-xs text-gray-400">Empty folder</span>
        )}
      </div>

      {/* Groups */}
      <div className="flex flex-wrap gap-1">
        {groups.slice(0, 2).map((g) =>
          typeof g === 'object' ? (
            <span
              key={g._id}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs"
            >
              {g.name}
            </span>
          ) : null
        )}
        {groups.length > 2 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
            +{groups.length - 2}
          </span>
        )}
      </div>
    </button>
  );
}

export default function StudentDashboard() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['student-folders'],
    queryFn: studentApi.getFolders,
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader />;

  const status = data?.status;

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
          <Clock size={28} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Awaiting Approval</h2>
        <p className="text-gray-500 max-w-sm">
          Your account is pending admin approval. You'll be able to access your notes once approved.
        </p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Account Rejected</h2>
        <p className="text-gray-500 max-w-sm">
          Your account registration was rejected. Please contact your admin for assistance.
        </p>
      </div>
    );
  }

  const folders = data?.folders ?? [];

  const filtered = folders.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.date.includes(search)
  );

  // Group by date
  const byDate = filtered.reduce<Record<string, Folder[]>>((acc, f) => {
    const key = f.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {folders.length} folder{folders.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search folders or dates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Empty */}
      {folders.length === 0 && (
        <div className="card p-12 text-center">
          <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600 mb-1">No folders yet</p>
          <p className="text-sm text-gray-400">
            Your admin hasn't shared any notes with your group yet.
          </p>
        </div>
      )}

      {/* Folders by date */}
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDate[date].map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onClick={() => navigate(`/folder/${folder._id}`)}
              />
            ))}
          </div>
        </div>
      ))}

      {search && filtered.length === 0 && folders.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No folders matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
