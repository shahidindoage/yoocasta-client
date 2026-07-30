import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAdminRoute = original?.url?.startsWith('/admin');

    if (error.response?.status === 401 && !original._retry) {
      if (original.url === '/admin/login') return Promise.reject(error);

      original._retry = true;
      try {
        const storage = sessionStorage.getItem('accessToken') ? sessionStorage : localStorage;
        const refreshToken = storage.getItem('refreshToken');
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        storage.setItem('accessToken', accessToken);
        storage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = isAdminRoute ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;