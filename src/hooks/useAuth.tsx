import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/axiosClient';
import { User, LoginCredentials } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => void;
  loginAsync: (credentials: LoginCredentials) => Promise<any>;
  isLoggingIn: boolean;
  loginError: unknown;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const queryClient = useQueryClient();

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await tokenStorage.get();
        if (token) {
          const response = await authApi.getMe();
          setAuthState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        await tokenStorage.remove();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (data) => {
      const { user, token } = data.data;
      await tokenStorage.set(token, user.role, user._id);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    onError: async () => {
      await tokenStorage.remove();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },
  });

  const logout = useCallback(async () => {
    await tokenStorage.remove();
    queryClient.clear();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login: loginMutation.mutate,
      loginAsync: loginMutation.mutateAsync,
      isLoggingIn: loginMutation.isPending,
      loginError: loginMutation.error,
      logout,
    }),
    [authState, loginMutation.error, loginMutation.isPending, loginMutation.mutate, loginMutation.mutateAsync, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

