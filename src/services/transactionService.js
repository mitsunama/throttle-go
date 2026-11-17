import { request } from '../config/api';

const post = (path) => request(path, { method: 'POST' });

export const transactionService = {
  cart: () => request('/transactions/cart'),
  requests: () => request('/transactions/requests'),
  history: () => request('/transactions/history'),
  addToCart: (id) => post(`/transactions/${id}/cart`),
  removeFromCart: (id) => post(`/transactions/${id}/cancel`),
  approve: (id) => post(`/transactions/${id}/approve`),
  decline: (id) => post(`/transactions/${id}/reject`),
};
