import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/axiosClient';
import { User, LoginCredentials } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
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

  const logout = async () => {
    await tokenStorage.remove();
    queryClient.clear();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
};

