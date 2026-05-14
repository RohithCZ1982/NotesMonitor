import { apiClient } from './client';
import { User, Group, Folder, ReportData } from '../types';

interface StudentsResponse {
  students: User[];
  total: number;
  page: number;
  limit: number;
}

interface FoldersResponse {
  folders: Folder[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  // ─── Students ───────────────────────────────────────────────────────────────
  getStudents: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get<{ data: StudentsResponse }>(
      '/admin/students',
      { params }
    );
    return data.data;
  },

  updateStudentStatus: async (id: string, status: 'active' | 'rejected' | 'pending') => {
    const { data } = await apiClient.patch<{ data: { user: User } }>(
      `/admin/students/${id}/status`,
      { status }
    );
    return data.data.user;
  },

  // ─── Groups ─────────────────────────────────────────────────────────────────
  getGroups: async () => {
    const { data } = await apiClient.get<{ data: { groups: Group[] } }>(
      '/admin/groups'
    );
    return data.data.groups;
  },

  createGroup: async (payload: {
    name: string;
    description?: string;
    students?: string[];
  }) => {
    const { data } = await apiClient.post<{ data: { group: Group } }>(
      '/admin/groups',
      payload
    );
    return data.data.group;
  },

  updateGroup: async (
    id: string,
    payload: { name?: string; description?: string }
  ) => {
    const { data } = await apiClient.put<{ data: { group: Group } }>(
      `/admin/groups/${id}`,
      payload
    );
    return data.data.group;
  },

  deleteGroup: async (id: string) => {
    await apiClient.delete(`/admin/groups/${id}`);
  },

  addStudentsToGroup: async (groupId: string, studentIds: string[]) => {
    const { data } = await apiClient.post<{ data: { group: Group } }>(
      `/admin/groups/${groupId}/students`,
      { studentIds }
    );
    return data.data.group;
  },

  removeStudentFromGroup: async (groupId: string, studentId: string) => {
    const { data } = await apiClient.delete<{ data: { group: Group } }>(
      `/admin/groups/${groupId}/students/${studentId}`
    );
    return data.data.group;
  },

  // ─── Folders ────────────────────────────────────────────────────────────────
  getFolders: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get<{ data: FoldersResponse }>(
      '/admin/folders',
      { params }
    );
    return data.data;
  },

  createFolder: async (payload: {
    name: string;
    date: string;
    assignedGroups?: string[];
  }) => {
    const { data } = await apiClient.post<{ data: { folder: Folder } }>(
      '/admin/folders',
      payload
    );
    return data.data.folder;
  },

  updateFolder: async (
    id: string,
    payload: { name?: string; date?: string }
  ) => {
    const { data } = await apiClient.put<{ data: { folder: Folder } }>(
      `/admin/folders/${id}`,
      payload
    );
    return data.data.folder;
  },

  deleteFolder: async (id: string) => {
    await apiClient.delete(`/admin/folders/${id}`);
  },

  uploadFiles: async (
    folderId: string,
    files: File[],
    onProgress?: (pct: number) => void
  ) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));

    const { data } = await apiClient.post<{
      data: { addedFiles: unknown[]; totalFiles: number };
    }>(`/admin/folders/${folderId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data.data;
  },

  deleteFile: async (folderId: string, fileId: string) => {
    await apiClient.delete(`/admin/folders/${folderId}/files/${fileId}`);
  },

  assignFolderToGroups: async (folderId: string, groupIds: string[]) => {
    const { data } = await apiClient.post<{ data: { folder: Folder } }>(
      `/admin/folders/${folderId}/assign`,
      { groupIds }
    );
    return data.data.folder;
  },

  // ─── Reports ────────────────────────────────────────────────────────────────
  getReports: async () => {
    const { data } = await apiClient.get<{ data: ReportData }>(
      '/admin/reports'
    );
    return data.data;
  },

  getFolderById: async (id: string) => {
    const { data } = await apiClient.get<{ data: { folder: Folder } }>(
      `/admin/folders?search=${id}`
    );
    return data.data;
  },
};
