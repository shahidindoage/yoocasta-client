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

export const toggleInternalCompany = (companyId: string) =>
  api.post(`/admin/companies/${companyId}/toggle-internal`);

export const getTalentSubscriptionDetails = (talentId: string) =>
  api.get(`/admin/talents/${talentId}/subscription`);

export const loginAsTalent = (talentId: string) =>
  api.post(`/admin/talents/${talentId}/login`);

export const getAdminBlogs = (page: number, limit: number = 20) =>
  api.get('/admin/blogs', { params: { page, limit } });

export const createBlog = (data: { title: string; description: string; image: string; date: string; categoryId: number | null }) =>
  api.post('/admin/blogs', data);

export const updateBlog = (blogId: number, data: { title: string; description: string; image?: string; date: string; categoryId: number | null }) =>
  api.put(`/admin/blogs/${blogId}`, data);

export const uploadBlogImage = (data: FormData) =>
  api.post('/admin/blogs/image', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteBlog = (blogId: number) =>
  api.delete(`/admin/blogs/${blogId}`);

export const getLanguages = (page: number = 1, limit: number = 20) =>
  api.get('/admin/languages', { params: { page, limit } });

export const createLanguage = (name: string) =>
  api.post('/admin/languages', { name });

export const deleteLanguage = (id: string) =>
  api.delete(`/admin/languages/${id}`);

export const updateLanguage = (id: string, name: string) =>
  api.put(`/admin/languages/${id}`, { name });

export const getNationalities = (page: number = 1, limit: number = 20) =>
  api.get('/admin/nationalities', { params: { page, limit } });

export const createNationality = (name: string) =>
  api.post('/admin/nationalities', { name });

export const updateNationality = (id: string, name: string) =>
  api.put(`/admin/nationalities/${id}`, { name });

export const deleteNationality = (id: string) =>
  api.delete(`/admin/nationalities/${id}`);

export const getEthnicities = (page: number = 1, limit: number = 20) =>
  api.get('/admin/ethnicities', { params: { page, limit } });

export const createEthnicity = (name: string) =>
  api.post('/admin/ethnicities', { name });

export const updateEthnicity = (id: string, name: string) =>
  api.put(`/admin/ethnicities/${id}`, { name });

export const deleteEthnicity = (id: string) =>
  api.delete(`/admin/ethnicities/${id}`);

export const getAdminCategories = (page: number = 1, limit: number = 20) =>
  api.get('/admin/categories', { params: { page, limit } });

export const createAdminCategory = (name: string) =>
  api.post('/admin/categories', { name });

export const updateAdminCategory = (id: string, name: string) =>
  api.put(`/admin/categories/${id}`, { name });

export const deleteAdminCategory = (id: string) =>
  api.delete(`/admin/categories/${id}`);

export const getAdminCities = (page: number = 1, limit: number = 20, countryId?: string) =>
  api.get('/admin/cities', { params: { page, limit, countryId } });

export const getAllCountries = () =>
  api.get('/admin/countries/all');

export const createCity = (data: { name: string; countryId: string | null }) =>
  api.post('/admin/cities', data);

export const updateCity = (id: string, data: { name: string; countryId: string | null }) =>
  api.put(`/admin/cities/${id}`, data);

export const deleteCity = (id: string) =>
  api.delete(`/admin/cities/${id}`);

export const getAdminCountries = (page: number = 1, limit: number = 20) =>
  api.get('/admin/countries', { params: { page, limit } });

export const createCountry = (name: string) =>
  api.post('/admin/countries', { name });

export const updateCountry = (id: string, name: string) =>
  api.put(`/admin/countries/${id}`, { name });

export const deleteCountry = (id: string) =>
  api.delete(`/admin/countries/${id}`);

export const getEmailTemplates = () =>
  api.get('/admin/email-templates');

export const getEmailTemplateByKey = (key: string) =>
  api.get(`/admin/email-templates/${key}`);

export const updateEmailTemplate = (key: string, data: { subject: string; body: string }) =>
  api.put(`/admin/email-templates/${key}`, data);
