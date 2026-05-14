import { apiClient } from './client';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  adminLogin: async (email: string, password: string) => {
    const { data } = await apiClient.post<{ data: LoginResponse }>(
      '/auth/admin/login',
      { email, password }
    );
    return data.data;
  },

  studentRegister: async (payload: {
    name: string;
    mobile: string;
    email: string;
    address?: string;
    password: string;
  }) => {
    const { data } = await apiClient.post<{ data: LoginResponse }>(
      '/auth/student/register',
      payload
    );
    return data.data;
  },

  studentLogin: async (mobile: string, password: string) => {
    const { data } = await apiClient.post<{ data: LoginResponse }>(
      '/auth/student/login',
      { mobile, password }
    );
    return data.data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<{ data: { user: User } }>('/auth/me');
    return data.data.user;
  },
};
