import api from './axios';

export const sendInvitation = (jobId: string, talentUserId: string) =>
  api.post('/invitations', { jobId, talentUserId });

export const getSentInvitations = () => api.get('/invitations');

export const getInvitationTalentIds = (jobId: string) =>
  api.get('/invitations/talent-ids', { params: { jobId } });

export const getPublicJobInvitation = (jobId: string) =>
  api.get(`/invitations/public/${jobId}`);

export const getMyInvitations = (params?: Record<string, any>) =>
  api.get('/invitations/my', { params });
