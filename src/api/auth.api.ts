import api from './axios';

export const registerTalent = (data: any) => api.post('/auth/register/talent', data);
export const registerRecruiter = (data: any) => api.post('/auth/register/recruiter', data);
export const login = (data: any) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = (token: string) => api.post('/auth/refresh', { refreshToken: token });
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (data: any) => api.post('/auth/verify-otp', data);
export const resetPassword = (data: any) => api.post('/auth/reset-password', data);
export const verifyEmail = (token: string) => api.get(`/auth/verify-email?token=${token}`);
export const resendVerification = (email: string) => api.post('/auth/resend-verification', { email });

export const getCountries = () => api.get('/jobs/countries');