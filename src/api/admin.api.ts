import api from './axios';

export const adminLogin = (email: string, password: string) =>
  api.post('/admin/login', { email, password });

export const getTalents = (page: number, limit: number = 20, status?: string, search?: string) =>
  api.get('/admin/talents', { params: { page, limit, status, search } });

export const getCompanies = (page: number, limit: number = 20, search?: string, verifyFilter?: string) =>
  api.get('/admin/companies', { params: { page, limit, search, verifyFilter } });

export const updateCompanyVerify = (companyId: string, isVerified: boolean) =>
  api.patch(`/admin/companies/${companyId}/verify`, { isVerified });

export const getActiveCompanies = () =>
  api.get('/admin/companies/active');

export const adminCreateJob = (data: any) =>
  api.post('/admin/jobs', data);

export const adminAddRole = (jobId: string, data: any) =>
  api.post(`/admin/jobs/${jobId}/roles`, data);

export const getJobPaymentDetails = (jobId: string) =>
  api.get(`/admin/jobs/${jobId}/payment`);

export const getAdminJobById = (jobId: string) =>
  api.get(`/admin/jobs/${jobId}`);

export const adminUpdateJob = (jobId: string, data: any) =>
  api.put(`/admin/jobs/${jobId}`, data);

export const adminUpdateRole = (jobId: string, roleId: string, data: any) =>
  api.put(`/admin/jobs/${jobId}/roles/${roleId}`, data);

export const getAdminJobs = (page: number, limit: number = 20, search?: string, statusFilter?: string) =>
  api.get('/admin/jobs', { params: { page, limit, search, statusFilter } });

export const updateAdminJobStatus = (jobId: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') =>
  api.patch(`/admin/jobs/${jobId}/status`, { status });

export const loginAsRecruiter = (companyId: string) =>
  api.post(`/admin/companies/${companyId}/login`);

export const updateCompanyStatus = (companyId: string, status: 'ACTIVE' | 'INACTIVE') =>
  api.patch(`/admin/companies/${companyId}/status`, { status });

export const updateTalentStatus = (talentId: string, status: 'ACTIVE' | 'INACTIVE') =>
  api.patch(`/admin/talents/${talentId}/status`, { status });

export const getTalentSubscriptionDetails = (talentId: string) =>
  api.get(`/admin/talents/${talentId}/subscription`);

export const loginAsTalent = (talentId: string) =>
  api.post(`/admin/talents/${talentId}/login`);
