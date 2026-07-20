import api from './axios';

export const getFavouriteIds = () => api.get('/favourites/ids');

export const addFavourite = (talentUserId: string) => api.post(`/favourites/${talentUserId}`);

export const removeFavourite = (talentUserId: string) => api.delete(`/favourites/${talentUserId}`);

export const getFavourites = (params?: {
  search?: string;
  nationalities?: string[];
  gender?: string;
  ageFrom?: number;
  ageTo?: number;
}) => api.get('/favourites', { params: { ...params, nationalities: params?.nationalities?.join(',') } });
