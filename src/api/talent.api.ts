import api from './axios';

export const getPublicProfile = (username: string) => api.get(`/talents/${username}`);

// Add these two functions for the Talent Listing page
export const getTalentFilterOptions = () => api.get('/talents/search/options');
export const searchTalents = (filters: any) => api.post('/talents/search', filters);
export const getTalentCategoryCounts = () => api.get('/talents/category-counts');
export const getFeaturedTalents = () => api.get('/talents/featured');