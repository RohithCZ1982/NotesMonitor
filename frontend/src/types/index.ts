export type UserRole = 'admin' | 'student';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  students: User[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  assignedGroups: Group[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  _id: string;
  originalName: string;
  publicId: string;   // Cloudinary public_id
  url: string;        // Cloudinary CDN URL (use this directly in <img>/<video>)
  mimetype: string;
  size: number;
  uploadDate: string;
}

export interface Folder {
  _id: string;
  name: string;
  date: string;
  files: FileRecord[];
  assignedGroups: Group[] | string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Download {
  _id: string;
  student: User | string;
  folder: Folder | string;
  fileId?: string;
  type: 'file' | 'folder';
  downloadedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportData {
  overview: {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    rejectedStudents: number;
    totalFolders: number;
    totalGroups: number;
    totalDownloads: number;
  };
  groupStats: Array<{ _id: string; name: string; studentCount: number }>;
  topFolders: Array<{
    _id: string;
    folderName: string;
    folderDate: string;
    count: number;
  }>;
  recentDownloads: Download[];
  recentFolders: Folder[];
}
