import api from './axios';

export const adminLogin = (email: string, password: string) =>
  api.post('/admin/login', { email, password });

export const getTalents = (page: number, limit: number = 20, status?: string) =>
  api.get('/admin/talents', { params: { page, limit, status } });

export const updateTalentStatus = (talentId: string, status: 'ACTIVE' | 'INACTIVE') =>
  api.patch(`/admin/talents/${talentId}/status`, { status });
