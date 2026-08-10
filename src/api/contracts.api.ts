import api from './axios';

export const createContract = (data: any) =>
  api.post('/contracts', data);

export const getContracts = (params: {
  status?: string;
  companyId?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const serialized: any = {};
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null || val === '') continue;
    serialized[key] = val;
  }
  return api.get('/contracts', { params: serialized });
};

export const renewContract = (id: string, data: {
  newExpiryDate: string;
  remarks?: string;
  usageDurationDays?: number;
  usageDurationLabel?: string;
}) =>
  api.post(`/contracts/${id}/renew`, data);

export const closeContract = (id: string, remarks?: string) =>
  api.post(`/contracts/${id}/close`, { remarks });

export const getContractDetails = (id: string) =>
  api.get(`/contracts/${id}`);

export const deleteContract = (id: string) =>
  api.delete(`/contracts/${id}`);
