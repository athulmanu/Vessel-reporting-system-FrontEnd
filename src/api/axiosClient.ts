import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.165:3000/api';
const TOKEN_KEY = '@vessel_app_token';
const USER_ROLE_KEY = '@vessel_app_user_role';
const USER_ID_KEY = '@vessel_app_user_id';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      try {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_ROLE_KEY, USER_ID_KEY]);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Token management helpers
export const tokenStorage = {
  set: async (token: string, role: string, userId: string) => {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_ROLE_KEY, role],
        [USER_ID_KEY, userId],
      ]);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },
  get: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  getRole: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(USER_ROLE_KEY);
    } catch (error) {
      console.error('Error getting role:', error);
      return null;
    }
  },
  getUserId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting userId:', error);
      return null;
    }
  },
  remove: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ROLE_KEY, USER_ID_KEY]);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

