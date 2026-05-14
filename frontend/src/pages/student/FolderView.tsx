import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Archive,
  Download,
  FileImage,
  FileVideo,
  Calendar,
  Layers,
  Eye,
  File,
} from 'lucide-react';
import { format } from 'date-fns';
import { studentApi } from '../../api/student';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import FilePreview from '../../components/shared/FilePreview';
import { FileRecord } from '../../types';
import { useToast } from '../../hooks/useToast';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ mimetype }: { mimetype: string }) {
  if (mimetype.startsWith('image/'))
    return <FileImage size={18} className="text-teal-500 shrink-0" />;
  if (mimetype.startsWith('video/'))
    return <FileVideo size={18} className="text-violet-500 shrink-0" />;
  return <File size={18} className="text-gray-400 shrink-0" />;
}

function fileTypeLabel(mimetype: string) {
  const map: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'video/mp4': 'MP4',
    'video/quicktime': 'MOV',
  };
  return map[mimetype] ?? mimetype.split('/')[1]?.toUpperCase() ?? 'FILE';
}

export default function FolderView() {
  const { folderId } = useParams<{ folderId: string }>();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const toast = useToast();

  const startDownload = (id: string) =>
    setDownloading((prev) => new Set(prev).add(id));
  const stopDownload = (id: string) =>
    setDownloading((prev) => { const s = new Set(prev); s.delete(id); return s; });

  const { data: folder, isLoading } = useQuery({
    queryKey: ['student-folder', folderId],
    queryFn: () => studentApi.getFolderById(folderId!),
    enabled: !!folderId,
  });

  if (isLoading) return <PageLoader />;
  if (!folder) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Folder not found or not accessible.</p>
        <Link to="/dashboard" className="text-teal-600 text-sm mt-2 inline-block">
          Back to folders
        </Link>
      </div>
    );
  }

  const handleDownloadFile = async (file: FileRecord) => {
    if (downloading.has(file._id)) return;
    startDownload(file._id);
    try {
      await studentApi.downloadFile(folderId!, file.url, file.originalName, file._id);
    } catch {
      toast.error(`Failed to download "${file.originalName}"`);
    } finally {
      stopDownload(file._id);
    }
  };

  const handleDownloadZip = async () => {
    if (downloading.has('zip')) return;
    startDownload('zip');
    try {
      await studentApi.downloadZip(folderId!, folder.name);
    } catch {
      toast.error('Failed to download ZIP');
    } finally {
      stopDownload('zip');
    }
  };

  const groups = Array.isArray(folder.assignedGroups)
    ? folder.assignedGroups.filter((g) => typeof g === 'object')
    : [];

  const images = folder.files.filter((f) => f.mimetype.startsWith('image/'));
  const videos = folder.files.filter((f) => f.mimetype.startsWith('video/'));

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to folders
      </Link>

      {/* Folder header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{folder.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {folder.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={13} />
                {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
              </span>
              {images.length > 0 && (
                <span className="flex items-center gap-1.5 text-teal-600">
                  <FileImage size={13} />
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </span>
              )}
              {videos.length > 0 && (
                <span className="flex items-center gap-1.5 text-violet-600">
                  <FileVideo size={13} />
                  {videos.length} video{videos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {groups.map((g) =>
                typeof g === 'object' ? (
                  <span
                    key={g._id}
                    className="px-2.5 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-medium"
                  >
                    {g.name}
                  </span>
                ) : null
              )}
            </div>
          </div>
          {folder.files.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={<Archive size={15} />}
              loading={downloading.has('zip')}
              onClick={handleDownloadZip}
              className="shrink-0"
            >
              <span className="hidden sm:inline">Download All</span>
              <span className="sm:hidden">ZIP</span>
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {folder.files.length === 0 && (
        <div className="card p-12 text-center">
          <Layers size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">This folder is empty.</p>
        </div>
      )}

      {/* File list */}
      {folder.files.length > 0 && (
        <div className="card overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Files — {folder.files.length}
            </p>
            <p className="text-xs text-gray-400 hidden sm:block">
              Click a file name to preview
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {folder.files.map((file, idx) => {
              const isPreviewable =
                file.mimetype.startsWith('image/') ||
                file.mimetype.startsWith('video/');

              return (
                <div
                  key={file._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  {/* Icon */}
                  <FileIcon mimetype={file.mimetype} />

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        'text-sm font-medium text-gray-800 truncate leading-snug',
                        isPreviewable
                          ? 'cursor-pointer hover:text-teal-600 transition-colors'
                          : '',
                      ].join(' ')}
                      onClick={() => isPreviewable && setPreviewIndex(idx)}
                      title={file.originalName}
                    >
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {formatSize(file.size)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs text-gray-400">
                        {fileTypeLabel(file.mimetype)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs text-gray-400">
                        {format(new Date(file.uploadDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isPreviewable && (
                      <button
                        onClick={() => setPreviewIndex(idx)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Preview"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={downloading.has(file._id)}
                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Download"
                    >
                      {downloading.has(file._id) ? (
                        <span className="w-4 h-4 border-2 border-teal-500 border-r-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <Download size={15} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File preview modal */}
      {previewIndex !== null && (
        <FilePreview
          files={folder.files}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onDownload={handleDownloadFile}
        />
      )}
    </div>
  );
}
