import api from './axios';

export const submitApplication = (roleId: string, formData: any) =>
  api.post('/applications', { roleId, formData });

export const getMyApplications = () =>
  api.get('/applications');

export const getJobApplications = (jobId: string) =>
  api.get(`/applications/job/${jobId}`);

export const getApplicationById = (applicationId: string) =>
  api.get(`/applications/${applicationId}`);

export const bulkUpdateStatus = (applicationIds: string[], status: string, subject: string, body: string) =>
  api.put('/applications/bulk-status', { applicationIds, status, subject, body });
