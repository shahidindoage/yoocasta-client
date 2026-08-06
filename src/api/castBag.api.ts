import api from './axios';

export const createCastBag = (name: string) =>
  api.post('/recruiter/cast-bags', { name });

export const getCastBags = () =>
  api.get('/recruiter/cast-bags');

export const getCastBagFeedbacks = (bagId: string) =>
  api.get(`/recruiter/cast-bags/${bagId}/feedbacks`);

export const deleteCastBag = (bagId: string) =>
  api.delete(`/recruiter/cast-bags/${bagId}`);

export const addTalentsToBag = (bagId: string, talentUserIds: string[]) =>
  api.post(`/recruiter/cast-bags/${bagId}/talents`, { talentUserIds });

export const shareCastBag = (bagId: string, emails: string[], validityDays: number) =>
  api.post(`/recruiter/cast-bags/${bagId}/share`, { emails, validityDays });

export const getPublicCastBag = (token: string) =>
  api.get(`/cast-bags/public/${token}`);

export const castBagFeedbackLogin = (token: string, email: string, password: string, talentUserId: string) =>
  api.post(`/cast-bags/public/${token}/feedback/login`, { email, password, talentUserId });

export const submitCastBagFeedback = (
  token: string,
  payload: { guestToken: string; talentUserId: string; rating: number; comment: string; decision: string }
) =>
  api.post(`/cast-bags/public/${token}/feedback`, payload);
