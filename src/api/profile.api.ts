import api from './axios';

export const getProfileOptions = () => api.get('/profile/options');
export const getMyProfile = () => api.get('/profile/me');
export const updateBasicInfo = (data: any) => api.put('/profile/basic-info', data);
export const updatePhysicalAttributes = (data: any) => api.put('/profile/physical-attributes', data);
export const updateCategoriesSkills = (data: any) => api.put('/profile/categories-skills', data);
export const updateBioDescription = (data: any) => api.put('/profile/bio-description', data);
export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append('profilePhoto', file);
  return api.post('/profile/photo', formData);
};

export const getPortfolioMedia = () => api.get('/profile/portfolio');

export const uploadPortfolioMedia = (formData: FormData) =>
  api.post('/profile/portfolio', formData);

export const deletePortfolioMedia = (mediaId: string) =>
  api.delete(`/profile/portfolio/${mediaId}`);


// ── NEW API CALLS ──────────────────────────────────────

// Career History
export const addCareerHistory = (data: any) => api.post('/profile/career-history', data);
export const updateCareerHistory = (historyId: string, data: any) => api.put(`/profile/career-history/${historyId}`, data);
export const deleteCareerHistory = (historyId: string) => api.delete(`/profile/career-history/${historyId}`);

// Talent Courses
export const addCourse = (data: any) => api.post('/profile/courses', data);
export const updateCourse = (courseId: string, data: any) => api.put(`/profile/courses/${courseId}`, data);
export const deleteCourse = (courseId: string) => api.delete(`/profile/courses/${courseId}`);

// Portfolio Extra
export const addPortfolioLink = (data: { videoLink: string; title?: string; type?: string }) => api.post('/profile/portfolio/link', data);
export const reorderPortfolio = (mediaIds: string[]) => api.put('/portfolio/reorder', { mediaIds });