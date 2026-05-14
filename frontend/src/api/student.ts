import { apiClient, downloadBlob, API_URL } from './client';
import { Folder, User } from '../types';

export const studentApi = {
  getFolders: async () => {
    const { data } = await apiClient.get<{
      data: { folders: Folder[]; status: string; message?: string };
    }>('/student/folders');
    return data.data;
  },

  getFolderById: async (folderId: string) => {
    const { data } = await apiClient.get<{ data: { folder: Folder } }>(
      `/student/folders/${folderId}`
    );
    return data.data.folder;
  },

  trackDownload: async (folderId: string, type: 'file' | 'folder', fileId?: string) => {
    await apiClient.post(`/student/folders/${folderId}/track-download`, { type, fileId });
  },

  // Individual file: direct download from Cloudinary CDN URL
  downloadFile: async (folderId: string, fileUrl: string, originalName: string, fileId: string) => {
    await studentApi.trackDownload(folderId, 'file', fileId).catch(() => {});

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  },

  // ZIP: streamed through our backend (needs auth to verify group membership)
  downloadZip: async (folderId: string, folderName: string) => {
    const url = `${API_URL}/api/student/folders/${folderId}/download-zip`;
    await downloadBlob(url, `${folderName}.zip`);
  },

  getProfile: async () => {
    const { data } = await apiClient.get<{ data: { user: User } }>('/student/profile');
    return data.data.user;
  },
};
