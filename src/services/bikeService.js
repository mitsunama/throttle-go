import { request } from '../config/api';

export const bikeService = {
  list: () => request('/bikes'),
  mine: () => request('/bikes/mine'),
  get: (id) => request(`/bikes/${id}`),
  create: (bike) => request('/bikes', { method: 'POST', body: JSON.stringify(bike) }),
  update: (id, bike) => request(`/bikes/${id}`, { method: 'PATCH', body: JSON.stringify(bike) }),
  remove: (id) => request(`/bikes/${id}`, { method: 'DELETE' }),
};
