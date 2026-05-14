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

  trackDownload: async (
    folderId: string,
    type: 'file' | 'folder',
    fileId?: string
  ) => {
    await apiClient.post(`/student/folders/${folderId}/track-download`, {
      type,
      fileId,
    });
  },

  downloadFile: async (
    folderId: string,
    filename: string,
    originalName: string,
    fileId: string
  ) => {
    await studentApi.trackDownload(folderId, 'file', fileId).catch(() => {});
    const url = `${API_URL}/api/student/files/${folderId}/${filename}`;
    await downloadBlob(url, originalName);
  },

  downloadZip: async (folderId: string, folderName: string) => {
    const url = `${API_URL}/api/student/folders/${folderId}/download-zip`;
    await downloadBlob(url, `${folderName}.zip`);
  },

  getProfile: async () => {
    const { data } = await apiClient.get<{ data: { user: User } }>(
      '/student/profile'
    );
    return data.data.user;
  },
};
