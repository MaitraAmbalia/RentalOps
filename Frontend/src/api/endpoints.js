export const API_BASE_URL = 'http://localhost:3000/api'; // Adjust port if backend runs elsewhere

export const ENDPOINTS = {
  AUTH: {
    CLIENT_LOGIN: '/auth/client/login',
    CLIENT_SIGNUP: '/auth/client/register',
    VENDOR_LOGIN: '/auth/vendor/login',
    VENDOR_SIGNUP: '/auth/vendor/register',
    PARTNER_LOGIN: '/auth/delivery/login',
    ME: '/auth/me',
  },
  PRODUCTS: {
    BASE: '/products',
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  CATEGORIES: {
    BASE: '/categories',
  }
};
