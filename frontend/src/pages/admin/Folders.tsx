import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Plus, Search, FolderOpen, Upload, Trash2, Image, Video, X,
  Download, Pencil, CheckSquare, Archive,
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import FilePreview from '../../components/shared/FilePreview';
import { Folder, FileRecord } from '../../types';
import { downloadBlob, API_URL } from '../../api/client';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FoldersPage() {
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<Folder | null>(null);
  const [deleteFile, setDeleteFile] = useState<{ folder: Folder; file: FileRecord } | null>(null);
  const [assignFolder, setAssignFolder] = useState<Folder | null>(null);
  const [previewState, setPreviewState] = useState<{ folder: Folder; index: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({ name: '', date: today });

  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-folders', search, page],
    queryFn: () => adminApi.getFolders({ search: search || undefined, page, limit: 20 }),
    placeholderData: (p) => p,
  });

  const { data: groupsData = [] } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: adminApi.getGroups,
  });

  const createMut = useMutation({
    mutationFn: adminApi.createFolder,
    onSuccess: (folder) => {
      toast.success('Folder created');
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      setCreateOpen(false);
      setForm({ name: '', date: today });
      setOpenFolder(folder);
    },
    onError: (e) => toast.apiError(e),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; date?: string } }) =>
      adminApi.updateFolder(id, data),
    onSuccess: () => {
      toast.success('Folder updated');
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      setEditFolder(null);
    },
    onError: (e) => toast.apiError(e),
  });

  const deleteFolderMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteFolder(id),
    onSuccess: () => {
      toast.success('Folder deleted');
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      setDeleteFolder(null);
      if (openFolder?._id === deleteFolder?._id) setOpenFolder(null);
    },
    onError: (e) => toast.apiError(e),
  });

  const deleteFileMut = useMutation({
    mutationFn: ({ folderId, fileId }: { folderId: string; fileId: string }) =>
      adminApi.deleteFile(folderId, fileId),
    onSuccess: () => {
      toast.success('File deleted');
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      setDeleteFile(null);
      if (openFolder) {
        const updated = { ...openFolder, files: openFolder.files.filter((f) => f._id !== deleteFile?.file._id) };
        setOpenFolder(updated);
      }
    },
    onError: (e) => toast.apiError(e),
  });

  const assignMut = useMutation({
    mutationFn: ({ folderId, groupIds }: { folderId: string; groupIds: string[] }) =>
      adminApi.assignFolderToGroups(folderId, groupIds),
    onSuccess: (folder) => {
      toast.success('Groups assigned');
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      setAssignFolder(null);
      if (openFolder?._id === folder._id) setOpenFolder(folder);
    },
    onError: (e) => toast.apiError(e),
  });

  const onDrop = useCallback((accepted: File[]) => {
    setPendingFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    maxSize: 100 * 1024 * 1024,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => toast.error(r.errors[0]?.message ?? 'File rejected'));
    },
  });

  const handleUpload = async () => {
    if (!openFolder || pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      await adminApi.uploadFiles(openFolder._id, pendingFiles, setUploadProgress);
      toast.success(`${pendingFiles.length} file(s) uploaded`);
      setPendingFiles([]);
      setUploadProgress(0);
      qc.invalidateQueries({ queryKey: ['admin-folders'] });
      const folders = await adminApi.getFolders({ page: 1, limit: 100 });
      const fresh = folders.folders.find((f) => f._id === openFolder._id);
      if (fresh) setOpenFolder(fresh);
    } catch (e) {
      toast.apiError(e, 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadZip = async (folder: Folder) => {
    const url = `${API_URL}/api/admin/folders/${folder._id}/download-zip`;
    await downloadBlob(url, `${folder.name}.zip`).catch(() => toast.error('Download failed'));
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Folders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total ?? 0} total folders
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Folder
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search folders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {/* Folders list */}
      {data?.folders.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No folders yet. Create your first folder.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {data?.folders.map((folder) => (
              <div
                key={folder._id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FolderOpen size={18} className="text-indigo-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{folder.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{folder.date}</span>
                    <span className="text-xs text-gray-400">
                      {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
                    </span>
                    {Array.isArray(folder.assignedGroups) && folder.assignedGroups.length > 0 && (
                      <span className="text-xs text-indigo-600">
                        {folder.assignedGroups.length} group{folder.assignedGroups.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOpenFolder(folder)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Open folder"
                  >
                    <FolderOpen size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setAssignFolder(folder);
                      const ids = (folder.assignedGroups as any[]).map((g) =>
                        typeof g === 'object' ? g._id : g
                      );
                      setSelectedGroups(ids);
                    }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Assign to groups"
                  >
                    <CheckSquare size={15} />
                  </button>
                  <button
                    onClick={() => handleDownloadZip(folder)}
                    className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Download ZIP"
                  >
                    <Archive size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setEditFolder(folder);
                      setForm({ name: folder.name, date: folder.date });
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteFolder(folder)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create folder modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Folder" size="sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate(form);
          }}
          className="px-6 py-4 space-y-4"
        >
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            label="Folder Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={`${form.date} - Topic Name`}
            required
          />
          <Button type="submit" fullWidth loading={createMut.isPending}>
            Create Folder
          </Button>
        </form>
      </Modal>

      {/* Edit folder modal */}
      <Modal open={!!editFolder} onClose={() => setEditFolder(null)} title="Edit Folder" size="sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editFolder) updateMut.mutate({ id: editFolder._id, data: form });
          }}
          className="px-6 py-4 space-y-4"
        >
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Input
            label="Folder Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Button type="submit" fullWidth loading={updateMut.isPending}>
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Assign groups modal */}
      <Modal
        open={!!assignFolder}
        onClose={() => setAssignFolder(null)}
        title="Assign to Groups"
        size="sm"
      >
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Select groups to assign <strong>{assignFolder?.name}</strong> to:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {groupsData.map((group) => (
              <label
                key={group._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={(e) => {
                    setSelectedGroups((prev) =>
                      e.target.checked
                        ? [...prev, group._id]
                        : prev.filter((id) => id !== group._id)
                    );
                  }}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-gray-400">
                    {group.students.length} students
                  </p>
                </div>
              </label>
            ))}
          </div>
          <Button
            fullWidth
            loading={assignMut.isPending}
            onClick={() => {
              if (assignFolder)
                assignMut.mutate({ folderId: assignFolder._id, groupIds: selectedGroups });
            }}
          >
            Save Assignment
          </Button>
        </div>
      </Modal>

      {/* Open folder modal */}
      <Modal
        open={!!openFolder}
        onClose={() => { setOpenFolder(null); setPendingFiles([]); }}
        title={openFolder?.name ?? ''}
        size="xl"
      >
        <div className="px-6 py-4 space-y-5">
          {/* Upload zone */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Upload Files</p>
            <div
              {...getRootProps()}
              className={[
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                isDragActive
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <input {...getInputProps()} />
              <Upload size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">
                {isDragActive ? 'Drop files here' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP, MP4, MOV · Max 100MB each
              </p>
            </div>

            {/* Pending files */}
            {pendingFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {pendingFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                  >
                    {f.type.startsWith('image/') ? (
                      <Image size={14} className="text-indigo-500" />
                    ) : (
                      <Video size={14} className="text-violet-500" />
                    )}
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                    <button
                      onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {isUploading && uploadProgress > 0 && (
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  fullWidth
                  onClick={handleUpload}
                  loading={isUploading}
                  icon={<Upload size={14} />}
                >
                  Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>

          {/* Files grid */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Files ({openFolder?.files.length ?? 0})
            </p>
            {openFolder?.files.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No files uploaded yet
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {openFolder?.files.map((file, idx) => {
                  const isImg = file.mimetype.startsWith('image/');
                  const isVid = file.mimetype.startsWith('video/');
                  const token = localStorage.getItem('nm_token');
                  const previewUrl = `${API_URL}/api/admin/files/${openFolder._id}/${file.filename}?t=${token}`;

                  return (
                    <div
                      key={file._id}
                      className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer"
                      onClick={() => setPreviewState({ folder: openFolder, index: idx })}
                    >
                      {isImg && (
                        <img
                          src={previewUrl}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {isVid && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                          <Video size={28} className="text-white/70" />
                          <span className="text-xs text-white/50 mt-1 px-2 text-center truncate w-full">
                            {file.originalName}
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-between p-1.5 opacity-0 group-hover:opacity-100">
                        <span className="text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded truncate max-w-[80%]">
                          {formatSize(file.size)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteFile({ folder: openFolder, file });
                          }}
                          className="p-1 bg-red-600 rounded-lg text-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {isVid && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">
                          VIDEO
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              icon={<CheckSquare size={15} />}
              onClick={() => {
                setAssignFolder(openFolder);
                const ids = (openFolder?.assignedGroups as any[])?.map((g) =>
                  typeof g === 'object' ? g._id : g
                ) ?? [];
                setSelectedGroups(ids);
              }}
            >
              Assign Groups
            </Button>
            {openFolder && (
              <Button
                variant="secondary"
                icon={<Download size={15} />}
                onClick={() => handleDownloadZip(openFolder)}
              >
                Download ZIP
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* File preview */}
      {previewState && (
        <FilePreview
          files={previewState.folder.files}
          initialIndex={previewState.index}
          folderId={previewState.folder._id}
          role="admin"
          onClose={() => setPreviewState(null)}
        />
      )}

      {/* Delete folder confirm */}
      <ConfirmModal
        open={!!deleteFolder}
        onClose={() => setDeleteFolder(null)}
        onConfirm={() => deleteFolder && deleteFolderMut.mutate(deleteFolder._id)}
        title="Delete Folder"
        message={`Delete "${deleteFolder?.name}" and all its files? This cannot be undone.`}
        confirmLabel="Delete Folder"
        loading={deleteFolderMut.isPending}
      />

      {/* Delete file confirm */}
      <ConfirmModal
        open={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={() =>
          deleteFile &&
          deleteFileMut.mutate({
            folderId: deleteFile.folder._id,
            fileId: deleteFile.file._id,
          })
        }
        title="Delete File"
        message={`Delete "${deleteFile?.file.originalName}"?`}
        confirmLabel="Delete File"
        loading={deleteFileMut.isPending}
      />
    </div>
  );
}
