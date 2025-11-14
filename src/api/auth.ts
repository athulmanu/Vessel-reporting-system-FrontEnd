import { apiClient } from './axiosClient';
import { LoginCredentials, AuthResponse, User } from '../types/user';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data;
  },
};

