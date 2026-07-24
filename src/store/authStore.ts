import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  isEmailVerified?: boolean;
  isVerified?: boolean;
  profileCompleted?: boolean;
  image?: string | null;
  name?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.clear();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updatedFields } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));