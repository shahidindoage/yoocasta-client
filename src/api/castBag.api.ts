import api from './axios';

export const createCastBag = (name: string) =>
  api.post('/recruiter/cast-bags', { name });

export const getCastBags = () =>
  api.get('/recruiter/cast-bags');

export const deleteCastBag = (bagId: string) =>
  api.delete(`/recruiter/cast-bags/${bagId}`);

export const addTalentsToBag = (bagId: string, talentUserIds: string[]) =>
  api.post(`/recruiter/cast-bags/${bagId}/talents`, { talentUserIds });

export const shareCastBag = (bagId: string, emails: string[], validityDays: number) =>
  api.post(`/recruiter/cast-bags/${bagId}/share`, { emails, validityDays });

export const getPublicCastBag = (token: string) =>
  api.get(`/cast-bags/public/${token}`);
