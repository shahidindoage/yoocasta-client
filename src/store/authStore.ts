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
  adminRole?: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

function initTokens() {
  // Check URL hash for impersonation tokens
  const hash = window.location.hash;
  if (hash.startsWith('#access_token=')) {
    try {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get('access_token');
      const refresh = params.get('refresh_token');
      const userStr = params.get('user');
      if (token && refresh && userStr) {
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('refreshToken', refresh);
        sessionStorage.setItem('user', userStr);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {}
  }
  return {
    accessToken: sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken'),
    user: JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'),
  };
}

const tokens = initTokens();

function getStorage() {
  return sessionStorage.getItem('accessToken') ? sessionStorage : localStorage;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: tokens.user,
  accessToken: tokens.accessToken,
  isAuthenticated: !!tokens.accessToken,

  setAuth: (user, accessToken, refreshToken) => {
    const storage = getStorage();
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    const storage = getStorage();
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
    storage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updatedFields } as User;
      const storage = getStorage();
      storage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));