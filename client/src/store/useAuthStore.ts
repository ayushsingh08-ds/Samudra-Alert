import { create } from 'zustand';
import type { ApiUser, LoginInput, RegisterInput } from '@samudra/shared';
import api from '../services/api';

interface AuthStore {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: ApiUser | null) => void;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    if (user?.role) localStorage.setItem('userRole', user.role);
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    if (data.user?.region) localStorage.setItem('userRegion', data.user.region);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData);
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/users/me');
      if (data?.region) localStorage.setItem('userRegion', data.region);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
