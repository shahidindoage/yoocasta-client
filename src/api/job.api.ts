import api from './axios';

export const getJobOptions = () => api.get('/jobs/options');
export const getMyJobs = () => api.get('/jobs/my-jobs');
export const getJobById = (jobId: string) => api.get(`/jobs/${jobId}`);
export const createJob = (data: any) => api.post('/jobs', data);
export const updateJob = (jobId: string, data: any) => api.put(`/jobs/${jobId}`, data);
export const deleteJob = (jobId: string) => api.delete(`/jobs/${jobId}`);
export const addRole = (jobId: string, data: any) => api.post(`/jobs/${jobId}/roles`, data);
export const updateRole = (jobId: string, roleId: string, data: any) => api.put(`/jobs/${jobId}/roles/${roleId}`, data);
export const deleteRole = (jobId: string, roleId: string) => api.delete(`/jobs/${jobId}/roles/${roleId}`);
export const getPublicJobById = (jobId: string) => api.get(`/jobs/public/${jobId}`);
export const uploadJobImage = (formData: FormData) =>
  api.post('/jobs/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const getPublicJobs = (params: any) => {
  const serialized: any = {};
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null || val === '') continue;
    serialized[key] = Array.isArray(val) ? val.join(',') : val;
  }
  return api.get('/jobs/public', { params: serialized });
};
